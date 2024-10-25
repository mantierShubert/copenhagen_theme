import { Datepicker as GardenDatepicker } from "@zendeskgarden/react-datepickers";
import {
  Field as GardenField,
  Hint,
  Input,
  Label,
  Message,
} from "@zendeskgarden/react-forms";
import { Span } from "@zendeskgarden/react-typography";
import type { Field } from "../data-types";
import type { ChangeEventHandler } from "react";
import { useMemo, useState } from "react";

interface DatePickerProps {
  field: Field;
  locale: string;
  valueFormat: "date" | "dateTime";
  onChange: (value: string) => void;
}

export function DatePicker({
  field,
  locale,
  valueFormat,
  onChange,
}: DatePickerProps): JSX.Element {
  const { label, error, value, name, required, description } = field;
  const [date, setDate] = useState(
    value ? new Date(value as string) : undefined
  );

  const dateTimeFormat = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        month: "long",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC",
      }),
    [locale]
  );

  /* Formats the date using the UTC time zone to prevent timezone-related issues.
   * By creating a new Date object with only the date, the time defaults to 00:00:00 UTC.
   * This avoids date shifts that can occur if formatted with the local time zone, as Garden does by default.
   */
  const formatDateInput = (date: Date) => {
    return dateTimeFormat.format(date);
  };

  const formatDateValue = (value: Date | undefined) => {
    if (value === undefined) {
      return "";
    }
    const isoString = value.toISOString();
    return valueFormat === "dateTime" ? isoString : isoString.split("T")[0];
  };

  const handleChange = (date: Date) => {
    // Set the time to 12:00:00 as this is also the expected behavior across Support and the API
    const newDate = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0)
    ) as Date;
    setDate(newDate);
    const dateString = formatDateValue(newDate);
    if (dateString !== undefined) {
      onChange(dateString);
    }
  };

  const handleInputChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    // Allow field to be cleared
    if (e.target.value === "") {
      setDate(undefined);
      onChange("");
    }
  };

  return (
    <GardenField>
      <Label>
        {label}
        {required && <Span aria-hidden="true">*</Span>}
      </Label>
      {description && (
        <Hint dangerouslySetInnerHTML={{ __html: description }} />
      )}
      <GardenDatepicker
        value={date}
        onChange={handleChange}
        formatDate={formatDateInput}
        locale={locale}
      >
        <Input
          required={required}
          lang={locale}
          onChange={handleInputChange}
          validation={error ? "error" : undefined}
        />
      </GardenDatepicker>
      {error && <Message validation="error">{error}</Message>}
      <input type="hidden" name={name} value={formatDateValue(date)} />
    </GardenField>
  );
}
