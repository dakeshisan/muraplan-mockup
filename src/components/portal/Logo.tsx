/**
 * Официальный вордмарк ATAMŪRA GROUP.
 * Тема переключает версию по классу `.dark` на <html>.
 */
export function Logo({
  className = "",
  alt = "ATAMŪRA GROUP",
}: {
  className?: string;
  alt?: string;
}) {
  return (
    <>
      <img
        src="/brand/logo-navy.svg"
        alt={alt}
        className={`block w-auto object-contain dark:hidden ${className}`}
        draggable={false}
      />
      <img
        src="/brand/logo-white.svg"
        alt={alt}
        className={`hidden w-auto object-contain dark:block ${className}`}
        draggable={false}
      />
    </>
  );
}
