"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

import {
  createPaymentAccount,
  updatePaymentAccount,
} from "../services/PaymentAccounts/PaymentAccountService";

import { PaymentAccount } from "../types/Paymentaccounts/paymentAccount";
import Swal from "sweetalert2";

interface Props {
  account?: PaymentAccount | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function PaymentAccountForm({
  account,
  onSuccess,
  onCancel,
}: Props) {
  const [loading, setLoading] = useState(false);

  const [logo, setLogo] = useState<File | null>(null);

  const [preview, setPreview] = useState<string | null>(null);


  const [form, setForm] = useState({
    name: "",
    account_name: "",
    account_number: "",
    type: "bank",
    instructions: "",
    is_active: true,
  });


  // Load data when editing
  useEffect(() => {

    if (account) {

      setForm({
        name: account.name,
        account_name: account.account_name,
        account_number: account.account_number,
        type: account.type,
        instructions: account.instructions ?? "",
        is_active: account.is_active,
      });


      setPreview(
        account.logo_url ?? null
      );

    } else {

      setForm({
        name: "",
        account_name: "",
        account_number: "",
        type: "bank",
        instructions: "",
        is_active: true,
      });

      setPreview(null);
      setLogo(null);

    }

  }, [account]);


  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement |
      HTMLTextAreaElement |
      HTMLSelectElement
    >
  ) => {

    const { name, value } = e.target;


    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

  };

  const handleLogoChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {

    const file = e.target.files?.[0];
    if (!file) return;
    setLogo(file);
    const imageUrl = URL.createObjectURL(file);
    setPreview(imageUrl);
  };
  const handleSubmit = async (
  e: React.FormEvent
) => {

  e.preventDefault();
  try {
    setLoading(true);
    const formData = new FormData();
    formData.append(
      "name",
      form.name
    );

    formData.append(
      "account_name",
      form.account_name
    );

    formData.append(
      "account_number",
      form.account_number
    );

    formData.append(
      "type",
      form.type
    );

    formData.append(
      "instructions",
      form.instructions
    );
    formData.append(
      "is_active",
      form.is_active ? "1" : "0"
    );
    if (logo) {
      formData.append(
        "logo",
        logo
      );

    }
    if (account) {
      formData.append(
        "_method",
        "PUT"
      );
      await updatePaymentAccount(
        account.id,
        formData
      );
      await Swal.fire({
        icon: "success",
        title: "Imesasishwa!",
        text: "Akaunti ya malipo imebadilishwa vizuri.",
        timer: 1500,
        showConfirmButton: false,
      });
    } else {
      await createPaymentAccount(
        formData
      );
      await Swal.fire({
        icon: "success",
        title: "Imehifadhiwa!",
        text: "Akaunti ya malipo imeongezwa vizuri.",
        timer: 1500,
        showConfirmButton: false,
      });
    }
    onSuccess();
  } catch (error: any) {
    console.error(
      "Payment account error:",
      error
    );
    Swal.fire({
      icon: "error",
      title: "Imeshindikana!",
      text:
        error?.data?.message ||
        error?.message ||
        "Imeshindikana kuhifadhi akaunti ya malipo.",
    });
  } finally {
    setLoading(false);
  }
};

  return (

    <div className="bg-white rounded-xl shadow p-6">


      <div className="flex justify-between items-center mb-6">

        <h3 className="text-xl font-semibold text-gray-800">

          {account
            ? "Hariri Account ya Malipo"
            : "Ongeza Account ya Malipo"
          }

        </h3>


        {account && (

          <span className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full">

            Editing

          </span>

        )}

      </div>




      <form
        onSubmit={handleSubmit}
        className="space-y-5"
      >



        {/* LOGO */}

        <div>

          <label className="block text-sm font-medium mb-2">
            Logo ya Account
          </label>

          <div className="flex items-center gap-5">
            <div className="h-24 w-24 rounded-xl border bg-gray-50 flex items-center justify-center overflow-hidden">

              {preview ? (

                <Image
                  src={preview}
                  alt="Logo preview"
                  width={80}
                  height={80}
                  className="object-contain"
                />

              ) : (

                <span className="text-gray-400 text-sm">
                  No Logo
                </span>

              )}

            </div>



            <input
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
              className="border rounded-lg px-4 py-2"
            />


          </div>

        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Jina la benki / wallet"
            className="border rounded-lg px-4 py-2.5"
            required
          />
          <input
            name="account_name"
            value={form.account_name}
            onChange={handleChange}
            placeholder="Jina la account"
            className="border rounded-lg px-4 py-2.5"
            required
          />
          <input
            name="account_number"
            value={form.account_number}
            onChange={handleChange}
            placeholder="Namba ya account"
            className="border rounded-lg px-4 py-2.5"
            required
          />
          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            className="border rounded-lg px-4 py-2.5"
          >

            <option value="bank">
              Bank
            </option>
            <option value="mpesa">
              M-Pesa
            </option>
            <option value="airtel_money">
              Airtel Money
            </option>
            <option value="tigopesa">
              Mix by Yas
            </option>
            <option value="halopesa">
              Halo Pesa
            </option>
          </select>
        </div>

        <textarea
          name="instructions"
          value={form.instructions}
          onChange={handleChange}
          placeholder="Maelekezo ya malipo"
          rows={4}
          className="w-full border rounded-lg px-4 py-3"

        />
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(e)=>
              setForm({
                ...form,
                is_active:e.target.checked
              })
            }
            className="h-4 w-4"
          />
          <span className="text-sm">
            Account Active
          </span>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg"

          >

            {loading
              ? "Inahifadhi..."
              : account
              ? "Update Account"
              : "Save Account"
            }

          </button>
          <button
            type="button"
            onClick={onCancel}
            className="border px-6 py-2.5 rounded-lg"
          >
            Cancel
          </button>

        </div>
      </form>
    </div>
  );
}