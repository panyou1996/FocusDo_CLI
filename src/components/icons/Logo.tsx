import * as React from "react";

export function Logo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M8 12.013V12C8 8.68629 10.6863 6 14 6H15C18.3137 6 21 8.68629 21 12V12.013"
        stroke="hsl(var(--primary))"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect
        x="4"
        y="12"
        width="24"
        height="14"
        rx="4"
        fill="hsl(var(--primary))"
        fillOpacity="0.1"
        stroke="hsl(var(--primary))"
        strokeWidth="2.5"
      />
      <path
        d="M12 18L14.5 20.5L20 15"
        stroke="hsl(var(--primary))"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
