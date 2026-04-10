import { ApartmentForm } from "@/types/apartment-form"
import { parseVNDInput } from "@/utils/format"
import { parseNumber } from "@/utils/number"
import { useMemo, useState } from "react"

export type DepositPreset = 1 | 2

type UseApartmentEditorStateParams = {
     isCreateMode: boolean
     initialForm: ApartmentForm | null
     defaultCreateForm: ApartmentForm
     initialRoomTags: string[]
}

type ApartmentFormPatch = Partial<Record<keyof ApartmentForm, unknown>>

const NUMBER_FIELDS = new Set<keyof ApartmentForm>([
     "floorNumber",
     "wardCode",
     "latitude",
     "longitude",
     "yearBuilt",
     "totalArea",
     "usableArea",
     "numberOfBedrooms",
     "numberOfBathrooms",
     "maxOccupants",
])

const CURRENCY_FIELDS = new Set<keyof ApartmentForm>([
     "baseRentPrice",
     "depositAmount",
])

const toNumberValue = (raw: unknown) => {
     if (typeof raw === "number") {
          return Number.isNaN(raw) ? undefined : raw
     }

     if (typeof raw === "string") {
          return parseNumber(raw)
     }

     return undefined
}

const toCurrencyValue = (raw: unknown) => {
     if (typeof raw === "number") {
          return Number.isNaN(raw) ? undefined : raw
     }

     if (typeof raw === "string") {
          return parseVNDInput(raw)
     }

     return undefined
}

export function useApartmentEditorState({
     isCreateMode,
     initialForm,
     defaultCreateForm,
     initialRoomTags,
}: UseApartmentEditorStateParams) {
     const [manualEditMode, setManualEditMode] = useState(false)
     const [draftForm, setDraftForm] = useState<ApartmentForm | null>(() =>
          isCreateMode ? defaultCreateForm : null,
     )
     const [selectedDepositPreset, setSelectedDepositPreset] = useState<DepositPreset | null>(null)

     const [tenantCount, setTenantCount] = useState(0)
     const [roomTags, setRoomTags] = useState<string[]>([])

     const form = useMemo(() => draftForm || initialForm, [draftForm, initialForm])

     const updateField = (key: keyof ApartmentForm, rawValue: unknown): ApartmentFormPatch => {
          let patch: ApartmentFormPatch = {}

          if (CURRENCY_FIELDS.has(key)) {
               const parsedValue = toCurrencyValue(rawValue)

               if (key === "depositAmount") {
                    setSelectedDepositPreset(null)
               }

               if (key === "baseRentPrice" && selectedDepositPreset && parsedValue !== undefined) {
                    patch = {
                         baseRentPrice: parsedValue,
                         depositAmount: parsedValue > 0 ? parsedValue * selectedDepositPreset : undefined,
                    }
               } else {
                    patch = { [key]: parsedValue }
               }
          } else if (NUMBER_FIELDS.has(key)) {
               patch = { [key]: toNumberValue(rawValue) }
          } else {
               patch = { [key]: rawValue }
          }

          setDraftForm((prev) => ({
               ...(prev || initialForm || defaultCreateForm),
               ...patch,
          } as ApartmentForm))

          return patch
     }

     // Compatibility wrappers for existing call sites during migration.
     const setField = (key: string, value: unknown) => {
          updateField(key as keyof ApartmentForm, value)
     }

     const setNumberField = (key: string, raw: string) => {
          updateField(key as keyof ApartmentForm, raw)
     }

     const setCurrencyField = (key: string, raw: string) => {
          updateField(key as keyof ApartmentForm, raw)
     }

     const applyDepositPreset = (value: DepositPreset) => {
          if (!form?.baseRentPrice || form.baseRentPrice <= 0) {
               return false
          }

          setSelectedDepositPreset(value)
          setField("depositAmount", (form.baseRentPrice * value) as ApartmentForm["depositAmount"])
          return true
     }

     const resetTransientState = () => {
          setSelectedDepositPreset(null)
          setRoomTags(initialRoomTags)
     }

     const startEditDraft = () => {
          if (!initialForm) return false
          setDraftForm(initialForm)
          return true
     }

     const resetCreateDraft = () => {
          setDraftForm(defaultCreateForm)
     }

     return {
          manualEditMode,
          setManualEditMode,
          draftForm,
          setDraftForm,
          form,
          selectedDepositPreset,
          tenantCount,
          setTenantCount,
          roomTags,
          setRoomTags,
          updateField,
          setField,
          setNumberField,
          setCurrencyField,
          applyDepositPreset,
          resetTransientState,
          startEditDraft,
          resetCreateDraft,
     }
}
