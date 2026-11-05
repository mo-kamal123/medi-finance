const PageHeading = ({ icon, children }) => (
  <div className="flex min-w-0 items-center gap-3">
    {icon && (
      <span
        aria-hidden="true"
        className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"
      >
        {icon}
      </span>
    )}
    <div className="min-w-0 space-y-1">{children}</div>
  </div>
);

export default PageHeading;
