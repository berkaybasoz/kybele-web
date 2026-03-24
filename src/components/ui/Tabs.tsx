type TabsProps<T extends string> = {
  value: T;
  onChange: (value: T) => void;
  items: { value: T; label: string }[];
};

export function Tabs<T extends string>({ value, onChange, items }: TabsProps<T>) {
  return (
    <div className="actions" style={{ gap: 4 }}>
      {items.map((item) => (
        <button
          key={item.value}
          className="btn"
          style={{
            background: item.value === value ? 'var(--tenant-primary)' : undefined,
            borderColor: item.value === value ? 'var(--tenant-primary)' : undefined,
          }}
          onClick={() => onChange(item.value)}
          type="button"
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
