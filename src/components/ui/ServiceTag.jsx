export default function ServiceTag({ serviceType }) {
  if (!serviceType) return null;
  return (
    <span
      className="text-xs px-2.5 py-1 rounded-full font-medium"
      style={{
        backgroundColor: `${serviceType.color}22`,
        color: serviceType.color,
      }}
    >
      {serviceType.name}
    </span>
  );
}