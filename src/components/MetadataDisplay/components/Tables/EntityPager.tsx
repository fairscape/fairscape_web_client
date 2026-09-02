import React from "react";
import styled from "styled-components";

const PagerBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.md};
  flex-wrap: wrap;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const RangeLabel = styled.span`
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: 11px;
  letter-spacing: 0.06em;
  color: ${({ theme }) => theme.colors.ink3};
  font-variant-numeric: tabular-nums;
`;

const Controls = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const PageButton = styled.button`
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: 11px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  padding: 6px 12px;
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.ink};
  border: 1px solid ${({ theme }) => theme.colors.borderStrong};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  cursor: pointer;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.backgroundHover};
  }

  &:disabled {
    color: ${({ theme }) => theme.colors.ink3};
    border-color: ${({ theme }) => theme.colors.border};
    cursor: default;
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }
`;

const PageCount = styled.span`
  font-family: ${({ theme }) => theme.fonts.mono};
  font-size: 11px;
  color: ${({ theme }) => theme.colors.ink2};
  font-variant-numeric: tabular-nums;
  min-width: 8ch;
  text-align: center;
`;

interface EntityPagerProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
}

const EntityPager: React.FC<EntityPagerProps> = ({
  page,
  pageSize,
  total,
  onPageChange,
  disabled = false,
}) => {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  if (total <= pageSize) return null;

  const first = page * pageSize + 1;
  const last = Math.min(total, (page + 1) * pageSize);

  return (
    <PagerBar>
      <RangeLabel>
        {first.toLocaleString()}&ndash;{last.toLocaleString()} of{" "}
        {total.toLocaleString()}
      </RangeLabel>
      <Controls>
        <PageButton
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={disabled || page <= 0}
        >
          Previous
        </PageButton>
        <PageCount>
          {page + 1} / {pageCount}
        </PageCount>
        <PageButton
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={disabled || page >= pageCount - 1}
        >
          Next
        </PageButton>
      </Controls>
    </PagerBar>
  );
};

export default EntityPager;
