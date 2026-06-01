'use client';

interface Visitor {
  prayer: boolean;
  salvation: boolean;
  joining: boolean;
  travel: boolean;
  other: string;
}

interface VisitorReasonsProps {
  visitor: Visitor;
}

export default function VisitorReasons({
  visitor,
}: VisitorReasonsProps) {
  const items: string[] = [];

  if (visitor.prayer) items.push('Maombi');
  if (visitor.salvation) items.push('Kuokoka');
  if (visitor.joining) items.push('Kujiunga');
  if (visitor.travel) items.push('Safari');
  if (visitor.other) items.push(visitor.other);

  if (items.length === 0) {
    return (
      <span className="text-gray-400 italic">
        Hakuna
      </span>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item, index) => (
        <span
          key={index}
          className="bg-blue-50 text-blue-700 border border-blue-100 text-xs px-2.5 py-1 rounded-lg font-medium"
        >
          {item}
        </span>
      ))}
    </div>
  );
}