"use client"

import {
     APARTMENT_REQUIRED_FIELDS,
     type ApartmentFieldErrors,
     type ApartmentValidationField,
     validateApartmentForm,
} from "@/lib/apartment/apartment-validation"
import type { ApartmentForm } from "@/types/apartment-form"
import { useCallback, useEffect, useMemo } from "react"
import {
     useForm,
     type FieldErrors,
     type Path,
     type Resolver,
} from "react-hook-form"

const apartmentFormResolver: Resolver<ApartmentForm> = async (values) => {
     const validationErrors = validateApartmentForm(values)

     if (validationErrors.length === 0) {
          return { values, errors: {} }
     }

     const errorMap: Record<string, { type: string; message: string }> = {}

     for (const current of validationErrors) {
          const field = current.field
          if (errorMap[field]) {
               continue
          }

          errorMap[field] = {
               type: "manual",
               message: current.message,
          }
     }

     return {
          values: {},
          errors: errorMap as unknown as FieldErrors<ApartmentForm>,
     }
}

type UseApartmentFormValidationParams = {
     form: ApartmentForm | null
}

export function useApartmentFormValidation({ form }: UseApartmentFormValidationParams) {
     const {
          reset,
          setValue,
          trigger,
          clearErrors,
          getFieldState,
          formState: { errors },
     } = useForm<ApartmentForm>({
          resolver: apartmentFormResolver,
          mode: "onSubmit",
          reValidateMode: "onChange",
          defaultValues: form || undefined,
     })

     useEffect(() => {
          if (!form) {
               return
          }

          // Keep RHF values aligned with the editor draft/initial form source.
          reset(form)
     }, [form, reset])

     const fieldErrors = useMemo<ApartmentFieldErrors>(() => {
          const errorMap = errors as Partial<Record<ApartmentValidationField, { message?: unknown }>>

          return APARTMENT_REQUIRED_FIELDS.reduce<ApartmentFieldErrors>((acc, field) => {
               const message = errorMap[field]?.message
               if (message) {
                    acc[field] = String(message)
               }
               return acc
          }, {})
     }, [errors])

     const syncValues = useCallback((patch: Partial<Record<keyof ApartmentForm, unknown>>) => {
          Object.entries(patch).forEach(([key, value]) => {
               setValue(key as Path<ApartmentForm>, value as never, {
                    shouldDirty: true,
                    shouldTouch: true,
                    shouldValidate: true,
               })
          })
     }, [setValue])

     const clearFieldError = useCallback((field: keyof ApartmentForm) => {
          clearErrors(field as Path<ApartmentForm>)
     }, [clearErrors])

     const clearAllErrors = useCallback(() => {
          clearErrors()
     }, [clearErrors])

     const validateRequired = useCallback(async () => {
          const isValid = await trigger(APARTMENT_REQUIRED_FIELDS as Path<ApartmentForm>[])

          if (isValid) {
               return {
                    isValid: true,
                    firstErrorMessage: undefined,
               }
          }

          const firstErrorMessage = APARTMENT_REQUIRED_FIELDS
               .map((field) => getFieldState(field as Path<ApartmentForm>).error?.message)
               .find(Boolean)

          return {
               isValid: false,
               firstErrorMessage: firstErrorMessage ? String(firstErrorMessage) : undefined,
          }
     }, [getFieldState, trigger])

     return {
          fieldErrors,
          syncValues,
          clearFieldError,
          clearAllErrors,
          validateRequired,
          reset,
     }
}
