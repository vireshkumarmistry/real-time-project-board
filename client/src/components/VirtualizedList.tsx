import * as React from "react";
import { FixedSizeList } from "react-window";
import type { ListChildComponentProps } from "react-window";

interface VirtualizedListProps<T> {
  items: T[];
  itemHeight: number;
  height: number;
  overflow?: string;
  width?: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  itemsPerRow?: number;
}

function VirtualizedList<T>({
  items,
  itemHeight,
  height,
  overflow,
  width,
  renderItem,
  className,
  itemsPerRow = 2,
}: VirtualizedListProps<T>) {
  const rowCount = Math.ceil(items.length / itemsPerRow);

  const Row = React.useCallback(
    ({ index, style }: ListChildComponentProps) => {
      const rowItems = [];
      const startIndex = index * itemsPerRow;

      for (let i = 0; i < itemsPerRow; i++) {
        const itemIndex = startIndex + i;
        if (itemIndex < items.length) {
          rowItems.push(
            <div key={itemIndex} style={{ flex: 1, margin: "0 8px" }}>
              {renderItem(items[itemIndex], itemIndex)}
            </div>
          );
        } else {
          rowItems.push(
            <div key={itemIndex} style={{ flex: 1, margin: "0 8px" }} />
          );
        }
      }

      return (
        <div
          style={{
            ...style,
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          {rowItems}
        </div>
      );
    },
    [items, itemsPerRow, renderItem]
  );

  return (
    <FixedSizeList
      className={className}
      height={height}
      style={{ overflow: overflow ?? "auto" }}
      itemCount={rowCount}
      itemSize={itemHeight}
      width={width ?? "100%"}
      layout="vertical"
    >
      {Row}
    </FixedSizeList>
  );
}

export default React.memo(VirtualizedList);
