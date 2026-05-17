import * as React from "react"

export function Paper({
  className,
  children,
  style,
  size = "A4",
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { size?: "POS" | "A4" }) {
  const isA4 = size === "A4"
  return (
    <div
      className={className}
      style={{
        width: "100%",
        maxWidth: isA4 ? "210mm" : "80mm",
        margin: "0 auto",
        backgroundColor: "#ffffff",
        padding: isA4 ? "40px" : "20px",
        fontFamily: isA4 ? "var(--font-sans), system-ui, sans-serif" : "monospace",
        fontSize: isA4 ? "13px" : "12px",
        color: "#000000",
        boxSizing: "border-box",
        border: isA4 ? "none" : "1px solid rgba(0,0,0,0.15)",
        textAlign: "left",
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  )
}

export function Text({
  className,
  align = "left",
  bold = false,
  italic = false,
  underline = false,
  style,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement> & {
  align?: "left" | "center" | "right" | "justify"
  bold?: boolean
  italic?: boolean
  underline?: boolean
}) {
  return (
    <p
      className={className}
      style={{
        marginTop: "4px",
        marginBottom: "4px",
        textAlign: align,
        fontWeight: bold ? "bold" : "normal",
        fontStyle: italic ? "italic" : "normal",
        textDecoration: underline ? "underline" : "none",
        lineHeight: "1.5",
        wordBreak: "break-word",
        ...style,
      }}
      {...props}
    >
      {children}
    </p>
  )
}

export function Line({ className, style, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={className}
      style={{
        borderTop: "1px dashed rgba(0,0,0,0.3)",
        marginTop: "12px",
        marginBottom: "12px",
        width: "100%",
        ...style,
      }}
      {...props}
    />
  )
}

export function DataTable({ className, style, children, ...props }: React.HTMLAttributes<HTMLTableElement>) {
  return (
    <table
      className={className}
      style={{
        width: "100%",
        borderCollapse: "collapse",
        marginTop: "16px",
        marginBottom: "16px",
        ...style,
      }}
      {...props}
    >
      {children}
    </table>
  )
}

export function TableRow({ className, style, children, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={className}
      style={{
        borderBottom: "1px solid rgba(0,0,0,0.08)",
        ...style,
      }}
      {...props}
    >
      {children}
    </tr>
  )
}

export function TableCell({
  className,
  align = "left",
  style,
  children,
  ...props
}: React.TdHTMLAttributes<HTMLTableCellElement> & {
  align?: "left" | "center" | "right"
}) {
  return (
    <td
      className={className}
      style={{
        paddingTop: "10px",
        paddingBottom: "10px",
        paddingLeft: "8px",
        paddingRight: "8px",
        verticalAlign: "middle",
        textAlign: align,
        fontSize: "12px",
        ...style,
      }}
      {...props}
    >
      {children}
    </td>
  )
}
