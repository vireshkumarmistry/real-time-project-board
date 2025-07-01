import * as React from "react";
import { FixedSizeList } from "react-window";
import type { ListChildComponentProps } from "react-window";

interface VirtualizedListProps<T> {
  items: T[];
  itemHeight: number;
  height: number;
  width: number | string;
  renderItem: (item: T, index: number) => React.ReactNode;
}

function VirtualizedList<T>({
  items,
  itemHeight,
  height,
  width,
  renderItem,
}: VirtualizedListProps<T>) {
  const Row = React.useCallback(
    ({ index, style }: ListChildComponentProps) => (
      <div style={style}>{renderItem(items[index], index)}</div>
    ),
    [items, renderItem]
  );

  return (
    <FixedSizeList
      height={height}
      itemCount={items.length}
      itemSize={itemHeight}
      width={width}
    >
      {Row}
    </FixedSizeList>
  );
}

export default React.memo(VirtualizedList);
