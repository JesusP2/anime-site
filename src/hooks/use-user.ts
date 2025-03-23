import type { User } from "better-auth";
import { useEffect, useState } from "react";
import { ulid } from "ulidx";

type UserData =
  | {
      isLoading: true;
      user: undefined;
    }
  | {
      isLoading: false;
      user: User;
    };
export function useUser(user?: User) {
  const [userData, setUserData] = useState<UserData>(
    user
      ? {
          isLoading: false,
          user,
        }
      : {
          isLoading: true,
          user: undefined,
        },
  );
  useEffect(() => {
    if (user) return;
    const localStorageUser = localStorage.getItem("user");
    if (localStorageUser) {
      setUserData({
        isLoading: false,
        user: JSON.parse(localStorageUser),
      });
    } else {
      const newUser: User = {
        id: ulid(),
        name: "Anonymous",
        email: "",
        emailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      localStorage.setItem("user", JSON.stringify(newUser));
      setUserData({
        isLoading: false,
        user: newUser,
      });
    }
  }, []);
  return userData;
}
