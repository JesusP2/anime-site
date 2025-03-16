import type { AnyFieldApi } from "@tanstack/react-form";

export function FieldInfo({ field }: { field: AnyFieldApi }) {
  return (
    <div className="text-sm font-normal text-destructive">
      {field.state.meta.isTouched && field.state.meta.errors.length ? (
        <em>
          {field.state.meta.errors.map((error) => error.message).join(", ")}
        </em>
      ) : null}
    </div>
  );
}
