import { ApartmentForm, parseNumber } from "@/types/apartment-modal"
import { parseVNDInput } from "@/utils/format"
import { useMemo, useState } from "react"

export type DepositPreset = 1 | 2

type UseApartmentEditorStateParams = {
     isCreateMode: boolean
     initialForm: ApartmentForm | null
     defaultCreateForm: ApartmentForm
     initialRoomTags: string[]
     initialIotBoardId?: string
}

export function useApartmentEditorState({
     isCreateMode,
     initialForm,
     defaultCreateForm,
     initialRoomTags,
     initialIotBoardId,
}: UseApartmentEditorStateParams) {
     const [manualEditMode, setManualEditMode] = useState(false)
     const [draftForm, setDraftForm] = useState<ApartmentForm | null>(() =>
          isCreateMode ? defaultCreateForm : null,
     )
     const [selectedDepositPreset, setSelectedDepositPreset] = useState<DepositPreset | null>(null)

     const [tenantCount, setTenantCount] = useState(0)
     const [selectedIotBoardId, setSelectedIotBoardId] = useState<string | undefined>()
     const [roomTags, setRoomTags] = useState<string[]>([])

     const form = useMemo(() => draftForm || initialForm, [draftForm, initialForm])

     const setField = <K extends keyof ApartmentForm>(key: K, value: ApartmentForm[K]) => {
          setDraftForm((prev) => ({
               ...(prev || initialForm || defaultCreateForm),
               [key]: value,
          }))
     }

     const setNumberField = <K extends keyof ApartmentForm>(key: K, raw: string) => {
          setField(key, parseNumber(raw) as ApartmentForm[K])
     }

     const setCurrencyField = <K extends keyof ApartmentForm>(key: K, raw: string) => {
          const parsedValue = parseVNDInput(raw) as ApartmentForm[K]

          if (key === "depositAmount") {
               setSelectedDepositPreset(null)
          }

          if (key === "baseRentPrice" && selectedDepositPreset && typeof parsedValue === "number") {
               setDraftForm((prev) => {
                    const baseForm = prev || initialForm || defaultCreateForm
                    const nextRent = parsedValue as number
                    return {
                         ...baseForm,
                         baseRentPrice: nextRent,
                         depositAmount: nextRent > 0 ? nextRent * selectedDepositPreset : undefined,
                    }
               })
               return
          }

          setField(key, parsedValue)
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
          setSelectedIotBoardId(initialIotBoardId)
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
          selectedIotBoardId,
          setSelectedIotBoardId,
          roomTags,
          setRoomTags,
          setField,
          setNumberField,
          setCurrencyField,
          applyDepositPreset,
          resetTransientState,
          startEditDraft,
          resetCreateDraft,
     }
}
