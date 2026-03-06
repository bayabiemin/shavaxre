interface SectionLabelProps {
    text: string;
    className?: string;
    light?: boolean; // for white/red background sections
}

export default function SectionLabel({ text, className = "", light = false }: SectionLabelProps) {
    return (
        <div className={`section-label ${light ? "section-label--light" : ""} ${className}`}>
            {text}
        </div>
    );
}
