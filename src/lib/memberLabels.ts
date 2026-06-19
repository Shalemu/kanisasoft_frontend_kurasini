export const MARITAL_STATUS_OPTIONS = [
  { value: "Ameoa", label: "Ameoa" },
  { value: "Ameolewa", label: "Ameolewa" },
  { value: "Hajaoa", label: "Hajaoa" },
  { value: "Hajaolewa", label: "Hajaolewa" },
  { value: "Mjane", label: "Mjane" },
  { value: "Mgane", label: "Mgane" },
];

const LEGACY_MARITAL_STATUS_MAP: Record<string, string> = {
  Nimeoa: "Ameoa",
  Nimeolewa: "Ameolewa",
  Sijaoa: "Hajaoa",
  Sijaolewa: "Hajaolewa",
};

export function normalizeGenderValue(gender: string) {
  if (gender === "Mwanaume") return "M";
  if (gender === "Mwanamke") return "F";

  return gender;
}

export function normalizeMaritalStatusForApi(maritalStatus: string, gender: string) {
  const normalizedGender = normalizeGenderValue(gender);

  if (maritalStatus === "Ndoa") {
    return normalizedGender === "F" ? "Ameolewa" : "Ameoa";
  }

  if (maritalStatus === "Bila ndoa") {
    return normalizedGender === "F" ? "Hajaolewa" : "Hajaoa";
  }

  return LEGACY_MARITAL_STATUS_MAP[maritalStatus] ?? maritalStatus;
}

export function isMarriedStatus(maritalStatus: string) {
  return maritalStatus === "Ameoa" || maritalStatus === "Ameolewa";
}

export type MembershipStatusLabels = Partial<Record<string, string>>;

export const DEFAULT_MEMBERSHIP_STATUS_LABELS: Record<string, string> = {
  active: "Active",
  pending: "Pending",
  left: "Amehama",
  lost: "Waliopoteza ushirika",
  deceased: "Amefariki",
  detained: "Ametegwa ushirika",
  rejected: "Waliokataliwa",
};

export function getMembershipStatusLabels(labels?: MembershipStatusLabels | null) {
  const mergedLabels: Record<string, string> = {
    ...DEFAULT_MEMBERSHIP_STATUS_LABELS,
  };

  Object.entries(labels ?? {}).forEach(([key, value]) => {
    if (value) mergedLabels[key] = value;
  });

  return mergedLabels;
}

export function getMembershipStatusLabel(
  status?: string | null,
  labels?: MembershipStatusLabels | null
) {
  if (!status) return "-";

  return getMembershipStatusLabels(labels)[status] ?? status;
}
