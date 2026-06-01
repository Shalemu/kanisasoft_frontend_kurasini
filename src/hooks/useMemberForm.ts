"use client";

import { useState } from "react";
import Swal from "sweetalert2";
import { apiFetch } from "@/lib/api";

export interface MemberFormData {
  fullName: string;
  gender: string;
  birthDate: string;

  birthRegion: string;
  birthDistrict: string;
  birthWard: string;
  birthStreet: string;
  birthPlace: string;

  residentialWard: string;
  residentialStreet: string;
  residence: string;

  maritalStatus: string;
  marriageType: string;
  spouseName: string;
  childrenCount: string;

  zone: string;
  phone: string;
  whatsappNumber: string;
  email: string;

  password: string;
  passwordConfirmation: string;

  hasDisability: string;
  disabilityDescription: string;

  conversionYear: string;
  conversionMonth: string;
  conversionDay: string;

  churchOfConversion: string;

  baptismYear: string;
  baptismMonth: string;
  baptismDay: string;

  baptismPlace: string;
  baptizerName: string;
  baptizerTitle: string;

  previousChurchStatus: string;
  tanguLini: string;
  kanisaUlipotoka: string;

  churchService: string;
  participatesCommunion: string;

  serviceDuration: string;
  educationLevel: string;
  profession: string;
  occupation: string;

  workPlace: string;
  workContact: string;

  livesAlone: string;
  livesWith: string;
  familyRole: string;
  liveWithWho: string;

  nextOfKin: string;
  nextOfKinPhone: string;
}

export const getEmptyMemberForm = (): MemberFormData => ({
  fullName: "",
  gender: "",
  birthDate: "",

  birthRegion: "",
  birthDistrict: "",
  birthWard: "",
  birthStreet: "",
  birthPlace: "",

  residentialWard: "",
  residentialStreet: "",
  residence: "",

  maritalStatus: "",
  marriageType: "",
  spouseName: "",
  childrenCount: "",

  zone: "",
  phone: "",
  whatsappNumber: "",
  email: "",

  password: "",
  passwordConfirmation: "",

  hasDisability: "",
  disabilityDescription: "",

  conversionYear: "",
  conversionMonth: "",
  conversionDay: "",

  churchOfConversion: "",

  baptismYear: "",
  baptismMonth: "",
  baptismDay: "",

  baptismPlace: "",
  baptizerName: "",
  baptizerTitle: "",

  previousChurchStatus: "",
  tanguLini: "",
  kanisaUlipotoka: "",

  churchService: "",
  participatesCommunion: "",

  serviceDuration: "",
  educationLevel: "",
  profession: "",
  occupation: "",

  workPlace: "",
  workContact: "",

  livesAlone: "",
  livesWith: "",
  familyRole: "",
  liveWithWho: "",

  nextOfKin: "",
  nextOfKinPhone: "",
});


export function useMemberForm(router: any) {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  const tabTitles = [
    "Taarifa Binafsi",
    "Taarifa za Imani",
    "Elimu na Kazi",
    "Familia",
  ];

  

  
const [form, setForm] = useState<MemberFormData>(getEmptyMemberForm());
  

  // =========================
  // HANDLE CHANGE
  // =========================

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,

      ...(name === "maritalStatus" &&
      !["Nimeoa", "Nimeolewa"].includes(value)
        ? {
            marriageType: "",
            spouseName: "",
          }
        : {}),

      ...(name === "hasDisability" && value === "hapana"
        ? {
            disabilityDescription: "",
          }
        : {}),

      ...(name === "livesAlone" && value === "ndio"
        ? {
            familyRole: "",
            liveWithWho: "",
            livesWith: "",
          }
        : {}),
    }));
  };

  // =========================
  // VALIDATION
  // =========================

  const validatePersonalInfo = () => {
    const required = [
      "fullName",
      "gender",
      "birthDate",
      "birthRegion",
      "birthDistrict",
      "residentialWard",
      "residentialStreet",
      "zone",
      "maritalStatus",
      "phone",
      "password",
      "passwordConfirmation",
      "hasDisability",
    ];

    for (const key of required) {
      if (!form[key as keyof MemberFormData]) {
        Swal.fire({
          title: "Tahadhari",
          text: "Jaza taarifa zote muhimu.",
          icon: "warning",
        });

        setActiveTab(0);
        return false;
      }
    }

    if (
      ["Nimeoa", "Nimeolewa"].includes(form.maritalStatus) &&
      !form.marriageType
    ) {
      Swal.fire({
        title: "Tahadhari",
        text: "Chagua aina ya ndoa.",
        icon: "warning",
      });

      return false;
    }

    if (
      form.hasDisability === "ndio" &&
      !form.disabilityDescription
    ) {
      Swal.fire({
        title: "Tahadhari",
        text: "Eleza aina ya ulemavu.",
        icon: "warning",
      });

      return false;
    }

    if (form.password !== form.passwordConfirmation) {
      Swal.fire({
        title: "Tatizo",
        text: "Password hazifanani.",
        icon: "error",
      });

      return false;
    }

    if (form.email) {
      const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(form.email)) {
        Swal.fire({
          title: "Email sio sahihi",
          icon: "error",
        });

        return false;
      }
    }

    if (!/^\d{10}$/.test(form.phone)) {
      Swal.fire({
        title: "Namba ya simu sio sahihi",
        text: "Lazima iwe tarakimu 10",
        icon: "error",
      });

      return false;
    }

    return true;
  };

  const validateFaithInfo = () => {
    const required = [
      "conversionYear",
      "churchOfConversion",
      "baptismYear",
      "baptizerName",
      "baptizerTitle",
      "previousChurchStatus",
    ];

    for (const key of required) {
      if (!form[key as keyof MemberFormData]) {
        Swal.fire({
          title: "Tahadhari",
          text: "Jaza taarifa za imani.",
          icon: "warning",
        });

        setActiveTab(1);
        return false;
      }
    }

    if (
      form.previousChurchStatus === "Nimehamia"
    ) {
      if (
        !form.tanguLini ||
        !form.kanisaUlipotoka
      ) {
        Swal.fire({
          title: "Tahadhari",
          text: "Jaza taarifa za kanisa ulipotoka.",
          icon: "warning",
        });

        return false;
      }
    }

    return true;
  };

  // =========================
  // NEXT
  // =========================

  const handleNext = (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (
      activeTab === 0 &&
      !validatePersonalInfo()
    )
      return;

    if (
      activeTab === 1 &&
      !validateFaithInfo()
    )
      return;

    if (activeTab < tabTitles.length - 1) {
      setActiveTab((prev) => prev + 1);
    }
  };

  // =========================
  // SUBMIT
  // =========================

  const handleRegister = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!validatePersonalInfo()) return;
    if (!validateFaithInfo()) return;

    const payload = {
      full_name: form.fullName,
      gender: form.gender === "Mwanaume" ? "M" : "F",

      birth_date: form.birthDate,
      birth_place:
        form.birthPlace || form.birthDistrict,

      birth_region: form.birthRegion,
      birth_district: form.birthDistrict,
      birth_ward: form.birthWard,
      birth_street: form.birthStreet,

      residence:
        form.residence ||
        `${form.residentialStreet}, ${form.residentialWard}`,

      residential_ward: form.residentialWard,
      residential_street:
        form.residentialStreet,

      marital_status: form.maritalStatus,
      marriage_type: form.marriageType,
      spouse_name: form.spouseName,

      children_count:
        Number(form.childrenCount) || 0,

      zone: form.zone,
      phone: form.phone,
      whatsapp_number:
        form.whatsappNumber,

      email: form.email,

      password: form.password,
      password_confirmation:
        form.passwordConfirmation,

      has_disability:
        form.hasDisability === "ndio",

      disability_description:
        form.disabilityDescription,

      conversion_year:
        Number(form.conversionYear) || null,

      conversion_month:
        Number(form.conversionMonth) || null,

      conversion_day:
        Number(form.conversionDay) || null,

      church_of_conversion:
        form.churchOfConversion,

      baptism_year:
        Number(form.baptismYear) || null,

      baptism_month:
        Number(form.baptismMonth) || null,

      baptism_day:
        Number(form.baptismDay) || null,

      baptism_place:
        form.baptismPlace,

      baptizer_name:
        form.baptizerName,

      baptizer_title:
        form.baptizerTitle,

      previous_church_status:
        form.previousChurchStatus,

      tangu_lini:
        form.tanguLini,

      kanisa_ulipotoka:
        form.kanisaUlipotoka,

      church_service:
        form.churchService,

      participates_communion:
        form.participatesCommunion === "ndio",

      education_level:
        form.educationLevel,

      profession:
        form.profession,

      occupation:
        form.occupation,

      work_place:
        form.workPlace,

      work_contact:
        form.workContact,

      lives_alone:
        form.livesAlone === "ndio",

      family_role:
        form.familyRole,

      live_with_who:
        form.liveWithWho,

      next_of_kin:
        form.nextOfKin,

      next_of_kin_phone:
        form.nextOfKinPhone,
    };

    try {
      setLoading(true);

      const response = await apiFetch(
        "/register",
        {
          method: "POST",
          body: JSON.stringify(payload),
        }
      );

   if (!response.error) {
  Swal.fire({
    title: "Usajili umefanikiwa",
    icon: "success",
  });

  // reset form instead of redirect
setForm(getEmptyMemberForm());
setActiveTab(0);
} else {
        Swal.fire({
          title: "Tatizo",
          text: response.message,
          icon: "error",
        });
      }
    } catch (error: any) {
      Swal.fire({
        title: "Tatizo",
        text:
          error?.message ||
          "Tatizo limetokea",
        icon: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // HELPERS
  // =========================

  const currentYear = new Date().getFullYear();

  const years = Array.from(
    { length: currentYear - 1900 + 1 },
    (_, i) => String(currentYear - i)
  );

  const months = [
    { value: "1", label: "Januari" },
    { value: "2", label: "Februari" },
    { value: "3", label: "Machi" },
    { value: "4", label: "Aprili" },
    { value: "5", label: "Mei" },
    { value: "6", label: "Juni" },
    { value: "7", label: "Julai" },
    { value: "8", label: "Agosti" },
    { value: "9", label: "Septemba" },
    { value: "10", label: "Oktoba" },
    { value: "11", label: "Novemba" },
    { value: "12", label: "Desemba" },
  ];

  const days = Array.from(
    { length: 31 },
    (_, i) => String(i + 1)
  );

  return {
    form,
    loading,
    activeTab,
    setActiveTab,
    tabTitles,

    handleChange,
    handleNext,
    handleRegister,

    years,
    months,
    days,
  };
}