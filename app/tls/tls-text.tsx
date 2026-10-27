/** Preserve literal file paths and options inside an uppercase teaching interface. */
export function TlsText({ text }: { text: string }) {
  const pattern =
    /(https?:\/\/[^\s]+|(?:~\/|\/(?:etc|home|root|usr|dev|var)\/)[^\s,;]+|\b[\w.-]+\.(?:crt|pem|key|csr|conf|cnf|ext|sh|csv|service|timer)\b|(?<![\w/])--?[A-Za-z][\w-]*)/g;
  return (
    <>
      {text
        .split(pattern)
        .map((part, i) => (i % 2 ? <code key={i}>{part}</code> : part))}
    </>
  );
}
