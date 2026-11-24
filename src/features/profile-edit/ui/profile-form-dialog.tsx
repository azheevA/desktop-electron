"use client";

import { useEffect, useState, type FormEvent } from "react";
import { UserRound, Save } from "lucide-react";
import { toast } from "sonner";
import { selectProfile, updateProfile } from "@/entities/profile";
import { useAppDispatch, useAppSelector } from "@/shared/lib";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  Input,
} from "@/shared/ui";

export function ProfileFormDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const dispatch = useAppDispatch();
  const profile = useAppSelector(selectProfile);
  const [firstName, setFirstName] = useState(profile.firstName);
  const [lastName, setLastName] = useState(profile.lastName);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setFirstName(profile.firstName);
    setLastName(profile.lastName);
    setError("");
  }, [open, profile.firstName, profile.lastName]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanFirstName = firstName.trim();
    const cleanLastName = lastName.trim();

    if (!cleanFirstName || !cleanLastName) {
      setError("Заполните имя и фамилию.");
      return;
    }
    if (cleanFirstName.length > 50 || cleanLastName.length > 50) {
      setError("Имя и фамилия не должны превышать 50 символов.");
      return;
    }

    dispatch(
      updateProfile({ firstName: cleanFirstName, lastName: cleanLastName }),
    );
    toast.success("Профиль обновлён");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <div className="mb-6 flex items-start gap-3 pr-8">
          <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#a5f36b17] text-accent">
            <UserRound size={19} />
          </div>
          <div>
            <DialogTitle className="text-lg font-bold text-[#edf2f7]">
              Личные данные
            </DialogTitle>
            <DialogDescription className="mt-1 text-xs leading-5 text-[#8290a1]">
              Имя и фамилия будут отображаться в профиле и приветствии.
            </DialogDescription>
          </div>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label
              htmlFor="profile-first-name"
              className="mb-2 block text-xs font-semibold text-[#b7c2cd]"
            >
              Имя
            </label>
            <Input
              id="profile-first-name"
              value={firstName}
              onChange={(event) => {
                setFirstName(event.target.value);
                setError("");
              }}
              maxLength={50}
              autoComplete="given-name"
              placeholder="Например, Александр"
              autoFocus
            />
          </div>
          <div>
            <label
              htmlFor="profile-last-name"
              className="mb-2 block text-xs font-semibold text-[#b7c2cd]"
            >
              Фамилия
            </label>
            <Input
              id="profile-last-name"
              value={lastName}
              onChange={(event) => {
                setLastName(event.target.value);
                setError("");
              }}
              maxLength={50}
              autoComplete="family-name"
              placeholder="Например, Ажеев"
            />
          </div>
          {error && (
            <p role="alert" className="text-xs text-[#f08b76]">
              {error}
            </p>
          )}
          <div className="flex justify-end gap-2 border-t border-line pt-4">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button type="submit">
              <Save size={14} /> Сохранить
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
