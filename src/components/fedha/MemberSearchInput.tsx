"use client";

import { useEffect, useRef, useState } from "react";
import { apiFetch } from "@/lib/api";
import { FaSearch } from "react-icons/fa";

interface Member {
  id: number;
  user_id?: number;
  member_id?: number;
  full_name: string;
  membership_number?: string | null;
}

interface Props {
  value: string;
  onSelect: (memberId: number | null, memberName: string, membershipNumber: string) => void;
  placeholder?: string;
}

function normalizeMemberList(response: any): Member[] {
  const list =
    response?.users ??
    response?.data?.users ??
    response?.members ??
    response?.data ??
    [];
  return Array.isArray(list) ? list : [];
}

export default function MemberSearchInput({ value, onSelect, placeholder = "Tafuta jina au namba ya ushirika..." }: Props) {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<Member[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const search = (term: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!term.trim()) {
      setResults([]);
      setOpen(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await apiFetch(`/users?search=${encodeURIComponent(term)}`);
        const members = normalizeMemberList(res);
        setResults(members.slice(0, 10));
        setOpen(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    onSelect(null, val, "");
    search(val);
  };

  const handleSelect = (member: Member) => {
    const name = member.full_name;
    const num = member.membership_number ?? "";
    const id = member.member_id ?? member.user_id ?? member.id;
    setQuery(name);
    setResults([]);
    setOpen(false);
    onSelect(id, name, num);
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="flex items-center rounded-xl border border-gray-300 bg-white px-3 dark:border-gray-700 dark:bg-gray-900">
        <FaSearch className="mr-2 flex-shrink-0 text-gray-400 text-sm" />
        <input
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder={placeholder}
          className="w-full bg-transparent py-3 text-sm outline-none dark:text-white"
        />
        {loading && (
          <svg className="animate-spin h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        )}
      </div>
      {open && results.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900 max-h-52 overflow-y-auto">
          {results.map((m) => (
            <li key={m.id}>
              <button
                type="button"
                onClick={() => handleSelect(m)}
                className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-800 flex justify-between gap-2"
              >
                <span className="font-medium text-gray-800 dark:text-white">{m.full_name}</span>
                {m.membership_number && (
                  <span className="text-xs text-gray-400">{m.membership_number}</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
