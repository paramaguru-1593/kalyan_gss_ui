import { DatePicker } from "antd";
import dayjs from "dayjs";

/**
 * Ant Design DatePicker wired for Formik or controlled usage.
 * - value: YYYY-MM-DD string or null
 * - onChange: (value: string | null) => void  (receives YYYY-MM-DD or null)
 * - disabled, min, max (YYYY-MM-DD strings), className, onBlur, ...rest
 */
export default function DatePickerField({
  value,
  onChange,
  onBlur,
  disabled = false,
  min,
  max,
  className: baseClasses = "",
  ...rest
}) {
  return (
    <DatePicker
      format="DD/MM/YYYY"
      value={value ? dayjs(value, "YYYY-MM-DD") : null}
      disabled={disabled}
      onChange={(date) => {
        if (!date) {
          onChange(null);
        } else {
          onChange(date.format("YYYY-MM-DD"));
        }
      }}
      onBlur={onBlur}
      className={baseClasses}
      disabledDate={(current) => {
        if (!current) return false;
        const minDate = min && min !== "" ? dayjs(min, "YYYY-MM-DD") : null;
        const maxDate = max && max !== "" ? dayjs(max, "YYYY-MM-DD") : null;
        if (minDate && current.isBefore(minDate, "day")) return true;
        if (maxDate && current.isAfter(maxDate, "day")) return true;
        return false;
      }}
      {...rest}
    />
  );
}
