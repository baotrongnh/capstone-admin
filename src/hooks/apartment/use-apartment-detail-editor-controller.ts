"use client"

import type { DepositPreset } from "@/hooks/apartment/use-apartment-editor-state"
import { useApartmentFormValidation } from "@/hooks/apartment/use-apartment-form-validation"
import { useApartmentIotAssignment } from "@/hooks/apartment/use-apartment-iot-assignment"
import { buildApartmentFormData } from "@/lib/apartment/apartment-form-data"
import type { ApartmentDetailData } from "@/types/apartment"
import type { ApartmentForm } from "@/types/apartment-form"
import { message } from "antd"

type RouterLike = {
     push: (path: string) => void
     replace: (path: string) => void
}

type UseApartmentDetailEditorControllerParams = {
     context: {
          isCreateMode: boolean
          isRouteEditMode: boolean
          allowEdit: boolean
          apartmentId: string | null
          detailApartment?: ApartmentDetailData
          roomTags: string[]
          initialRoomTags: string[]
          canSaveChanges: boolean
          usableAreaInvalid: boolean
          showIotSection: boolean
     }
     editorState: {
          form: ApartmentForm | null
          updateField: (key: keyof ApartmentForm, rawValue: unknown) => Partial<Record<keyof ApartmentForm, unknown>>
          setTenantCount: (value: number) => void
          setRoomTags: (tags: string[]) => void
          resetTransientState: () => void
          startEditDraft: () => boolean
          resetCreateDraft: () => void
          setDraftForm: (value: ApartmentForm | null) => void
          setManualEditMode: (value: boolean) => void
          applyDepositPreset: (value: DepositPreset) => boolean
     }
     mediaState: {
          selectedImageFiles: File[]
          selectedVideoFile: File | null
          resetMediaState: () => void
     }
     iotAssignment: Pick<
          ReturnType<typeof useApartmentIotAssignment>,
          | "selectedBoardIds"
          | "syncIotBoardAssignment"
          | "hasSelectionChanges"
          | "normalizedInitialBoardIds"
          | "normalizedSelectedBoardIds"
          | "resetSelectionToInitial"
     >
     formValidation: ReturnType<typeof useApartmentFormValidation>
     geocoding: {
          resetGeocodeTracking: () => void
          markManualCoordinatePick: () => void
     }
     actions: {
          onCreateSuccess?: () => void
          onCreateCancel?: () => void
          refetchApartmentDetail: () => Promise<unknown>
          createApartmentMutate: (payloadData: FormData) => Promise<{ data?: { id?: string } }>
          updateApartmentMutate: (params: { id: string; data: FormData }) => Promise<unknown>
     }
     router: RouterLike
}

export function useApartmentDetailEditorController({
     context,
     editorState,
     mediaState,
     iotAssignment,
     formValidation,
     geocoding,
     actions,
     router,
}: UseApartmentDetailEditorControllerParams) {
     const {
          isCreateMode,
          isRouteEditMode,
          allowEdit,
          apartmentId,
          detailApartment,
          roomTags,
          initialRoomTags,
          canSaveChanges,
          usableAreaInvalid,
          showIotSection,
     } = context

     const {
          form,
          updateField,
          setTenantCount,
          setRoomTags,
          resetTransientState,
          startEditDraft,
          resetCreateDraft,
          setDraftForm,
          setManualEditMode,
          applyDepositPreset,
     } = editorState

     const {
          selectedImageFiles,
          selectedVideoFile,
          resetMediaState,
     } = mediaState

     const {
          onCreateSuccess,
          onCreateCancel,
          refetchApartmentDetail,
          createApartmentMutate,
          updateApartmentMutate,
     } = actions

     const applyFieldUpdate = (field: keyof ApartmentForm, value: unknown) => {
          const patch = updateField(field, value)
          formValidation.syncValues(patch)
          formValidation.clearFieldError(field)
          return patch
     }

     const handleFieldChange = (field: string, value: unknown) => {
          applyFieldUpdate(field as keyof ApartmentForm, value)
     }

     const handleNumberFieldChange = (key: string, raw: string) => {
          applyFieldUpdate(key as keyof ApartmentForm, raw)
     }

     const handleCurrencyFieldChange = (key: string, raw: string) => {
          applyFieldUpdate(key as keyof ApartmentForm, raw)
     }

     const validateBeforeSave = async () => {
          const validationResult = await formValidation.validateRequired()
          if (!validationResult.isValid) {
               message.error(validationResult.firstErrorMessage || "Vui lòng kiểm tra lại thông tin bắt buộc")
               return false
          }

          if (usableAreaInvalid) {
               message.error("Diện tích sử dụng không được lớn hơn diện tích tổng")
               return false
          }

          return true
     }

     const handleCancelEdit = () => {
          resetMediaState()
          resetTransientState()
          iotAssignment.resetSelectionToInitial()
          formValidation.clearAllErrors()
          geocoding.resetGeocodeTracking()

          if (isCreateMode) {
               resetCreateDraft()
               if (onCreateCancel) {
                    onCreateCancel()
               } else {
                    router.push("/operator/apartments")
               }
               return
          }

          setDraftForm(null)
          setManualEditMode(false)

          if (isRouteEditMode && apartmentId) {
               router.replace(`/operator/apartments/${apartmentId}`)
          }
     }

     const handleCreateApartment = async (payloadData: FormData) => {
          try {
               const createdApartmentResponse = await createApartmentMutate(payloadData)
               const createdApartmentId = createdApartmentResponse?.data?.id

               if (
                    createdApartmentId &&
                    showIotSection &&
                    iotAssignment.selectedBoardIds.length > 0
               ) {
                    try {
                         await iotAssignment.syncIotBoardAssignment({
                              apartmentTargetId: createdApartmentId,
                              previousBoardIds: [],
                              nextBoardIds: iotAssignment.selectedBoardIds,
                         })
                    } catch {
                         message.warning("Đã tạo căn hộ nhưng chưa gắn được mạch IoT. Vui lòng thử lại.")
                    }
               }

               resetMediaState()
               resetTransientState()
               resetCreateDraft()
               if (onCreateSuccess) {
                    onCreateSuccess()
               } else {
                    router.push("/operator/apartments")
               }
          } catch {
               // Error toast is handled in mutation hook.
          }
     }

     const handleUpdateApartment = async (payloadData: FormData) => {
          if (!apartmentId) return

          if (!canSaveChanges) {
               message.info("Chưa có thay đổi để lưu")
               return
          }

          try {
               await updateApartmentMutate({ id: apartmentId, data: payloadData })

               if (showIotSection && iotAssignment.hasSelectionChanges) {
                    await iotAssignment.syncIotBoardAssignment({
                         apartmentTargetId: apartmentId,
                         previousBoardIds: iotAssignment.normalizedInitialBoardIds,
                         nextBoardIds: iotAssignment.normalizedSelectedBoardIds,
                    })
               }

               if (JSON.stringify(roomTags) !== JSON.stringify(initialRoomTags)) {
                    message.info("Danh sách phòng đã cập nhật trên UI và sẵn sàng nối BE.")
               }

               await refetchApartmentDetail()
               handleCancelEdit()
          } catch {
               // Error toast is handled in mutation hook.
          }
     }

     const handleSave = async () => {
          if (!form) return

          if (!(await validateBeforeSave())) {
               return
          }

          const payloadData = buildApartmentFormData(form, {
               mode: isCreateMode ? "create" : "update",
               imageFiles: selectedImageFiles,
               videoFile: selectedVideoFile,
          })

          if (isCreateMode) {
               await handleCreateApartment(payloadData)
               return
          }

          await handleUpdateApartment(payloadData)
     }

     const handlePickCoordinate = (value: { latitude: number; longitude: number }) => {
          handleFieldChange("latitude", value.latitude)
          handleFieldChange("longitude", value.longitude)
          geocoding.markManualCoordinatePick()
     }

     const handleStartEdit = () => {
          if (isCreateMode) return
          if (!allowEdit) return

          if (!startEditDraft()) return

          setTenantCount(detailApartment?.userApartments.length ?? 0)
          setRoomTags(initialRoomTags)
          iotAssignment.resetSelectionToInitial()
          formValidation.clearAllErrors()
          geocoding.resetGeocodeTracking()
          setManualEditMode(true)
     }

     const handleRemoveExistingImage = (index: number) => {
          if (!form) return

          applyFieldUpdate("images", (form.images || []).filter((_, currentIndex) => currentIndex !== index))
     }

     const handleSelectDepositPreset = (value: DepositPreset) => {
          const applied = applyDepositPreset(value)
          if (!applied) {
               message.info("Vui lòng nhập giá thuê trước khi chọn nhanh tiền cọc")
               return
          }

          if (form?.baseRentPrice && form.baseRentPrice > 0) {
               formValidation.syncValues({ depositAmount: form.baseRentPrice * value })
          }
     }

     return {
          handleFieldChange,
          handleNumberFieldChange,
          handleCurrencyFieldChange,
          handlePickCoordinate,
          handleStartEdit,
          handleCancelEdit,
          handleRemoveExistingImage,
          handleSelectDepositPreset,
          handleSave,
     }
}
