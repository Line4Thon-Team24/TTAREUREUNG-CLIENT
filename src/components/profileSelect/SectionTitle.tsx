type SectionTitleProps = {
  title: string;
  count: number;
};

// 섹션별 타이틀 + 인원수 표시
export default function SectionTitle({ title, count }: SectionTitleProps) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="flex items-center gap-1.5 text-[14px] font-bold text-text-title">
        <span
          aria-hidden
          className="h-4.5 w-1.5 rounded-full bg-border-focus"
        />
        {title}
      </h2>
      <span className="text-[12px] font-semibold text-text-sub">{count}명</span>
    </div>
  );
}
