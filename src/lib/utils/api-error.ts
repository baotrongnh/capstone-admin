type ApiErrorLike = {
  message?: unknown;
  response?: {
    data?: {
      message?: unknown;
      error?: unknown;
    };
  };
};

const translateCommonError = (message: string) => {
  const normalized = message.trim();

  const exactTranslations: Record<string, string> = {
    "Request failed with status code 400": "Yêu cầu không hợp lệ.",
    "Request failed with status code 401":
      "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.",
    "Request failed with status code 403":
      "Bạn không có quyền thực hiện thao tác này.",
    "Request failed with status code 404": "Không tìm thấy dữ liệu.",
    "Request failed with status code 500":
      "Lỗi hệ thống, vui lòng thử lại sau.",
    "Staff email already exists": "Email nhân viên đã tồn tại.",
    "Operator email already exists": "Email nhân viên vận hành đã tồn tại.",
    "Email already exists": "Email đã tồn tại.",
    "Email is already used": "Email đã được sử dụng.",
    "Phone already exists": "Số điện thoại đã tồn tại.",
    "Employee code already exists": "Mã nhân viên đã tồn tại.",
    "Duplicate entry": "Dữ liệu đã tồn tại.",
  };

  if (exactTranslations[normalized]) {
    return exactTranslations[normalized];
  }

  const patternTranslations: Array<[RegExp, string]> = [
    [
      /must be one of the following values:/gi,
      "chỉ được chọn một trong các giá trị sau:",
    ],
    [/must be a valid email/gi, "phải là email hợp lệ"],
    [/must be an email/gi, "phải là email hợp lệ"],
    [/must be a string/gi, "phải là chuỗi"],
    [/must not be empty/gi, "không được để trống"],
    [/should not be empty/gi, "không được để trống"],
    [/is required/gi, "là bắt buộc"],
    [/must be greater than or equal to/gi, "phải lớn hơn hoặc bằng"],
    [/must be less than or equal to/gi, "phải nhỏ hơn hoặc bằng"],
    [/already exists/gi, "đã tồn tại"],
    [/is already used/gi, "đã được sử dụng"],
    [/must be a valid uuid/gi, "phải là UUID hợp lệ"],
    [/must be a valid date/gi, "phải là ngày hợp lệ"],
    [/must be a valid number/gi, "phải là số hợp lệ"],
    [/must be a positive number/gi, "phải là số dương"],
  ];

  return patternTranslations.reduce(
    (result, [pattern, replacement]) => result.replace(pattern, replacement),
    normalized,
  );
};

const toMessageString = (value: unknown): string => {
  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => toMessageString(item))
      .filter(Boolean)
      .join("\n");
  }

  if (value && typeof value === "object") {
    if ("message" in value) {
      return toMessageString((value as { message?: unknown }).message);
    }

    if ("error" in value) {
      return toMessageString((value as { error?: unknown }).error);
    }

    try {
      return JSON.stringify(value);
    } catch {
      return "";
    }
  }

  return "";
};

export const getErrorMessage = (
  error: unknown,
  fallback = "Đã có lỗi xảy ra, vui lòng thử lại sau!",
) => {
  if (!error || typeof error !== "object") {
    return fallback;
  }

  const apiError = error as ApiErrorLike;
  const responseMessage = toMessageString(
    apiError.response?.data?.message ?? apiError.response?.data?.error,
  );
  const topLevelMessage = toMessageString(apiError.message);
  const finalMessage = responseMessage || topLevelMessage || fallback;

  const translatedLines = finalMessage
    .split(/\r?\n/)
    .map((line) => translateCommonError(line))
    .filter(Boolean)
    .join("\n");

  return translatedLines || translateCommonError(finalMessage) || fallback;
};
