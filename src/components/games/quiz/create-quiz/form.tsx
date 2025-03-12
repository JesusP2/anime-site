import { createFormHook } from '@tanstack/react-form';
import { useFieldContext } from './form-context';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function TextField({ label }: { label: string }) {
	const field = useFieldContext();
	return (
		<div className="space-y-2" >
			<Label htmlFor="title" > Quiz Title </Label>
			<Input
				id="title"
				placeholder="Enter a catchy title for your quiz"
			/>
		</div>
	)
}

const { useAppForm } = createFormHook({
	fieldComponents: {
		TextField,
		NumberField,
	},
	formComponents: {
		SubmitButton,
	},
	fieldContext,
	formContext,
})
