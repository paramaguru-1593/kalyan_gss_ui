import { useCallback, useEffect } from "react";
import { useSelector } from "react-redux";

export default function useDebounce(effect, dependencies, delay) {
    const callback = useCallback(effect, dependencies);

    useEffect(() => {
        const timeout = setTimeout(callback, delay);
        return () => clearTimeout(timeout);
    }, [callback, delay]);
}

export const formatDateTime = (input) => {
    if (!input) return "NA";
  
    // Add 'T' if time is included for ISO compatibility
    const isDateTime = input.includes(" ");
    const date = new Date(isDateTime ? input.replace(" ", "T") : input);
  
    if (isNaN(date)) return "NA"; // invalid date fallback
  
    const optionsDateOnly = { day: "2-digit", month: "short", year: "numeric" };
    const optionsDateTime = {
      ...optionsDateOnly,
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    };
  
    return date.toLocaleString("en-GB", isDateTime ? optionsDateTime : optionsDateOnly);
};

export const formatCurrency = (num) => new Intl.NumberFormat("en-IN").format(num);


export const convertHoursToHHMMSS = (talkTime) => {
    const minutes = Math.floor(talkTime);                 // 53
    const seconds = Math.round((talkTime % 1) * 100);     // 57
    const totalSeconds = minutes * 60 + seconds;

    const hh = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
    const mm = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
    const ss = String(totalSeconds % 60).padStart(2, '0');

    return `${hh}:${mm}:${ss}`;
};

export const convertMinutesToHHMMSS = (talkTime) => {
  const totalSeconds = Math.round(talkTime * 60); // minutes → seconds

  const hh = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
  const mm = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
  const ss = String(totalSeconds % 60).padStart(2, '0');

  return `${hh}:${mm}:${ss}`;
};

export const getBucketName = (bucketId) => {    
    const bucketDetails = JSON.parse(localStorage.getItem('bucketList')) || [];    
    const bucket = bucketDetails.find((b) => b.bucket_id == bucketId);
    return bucket ? bucket.bucket_label : "Unknown Bucket";
}
