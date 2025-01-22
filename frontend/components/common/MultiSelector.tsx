import React, { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { X } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

interface MultiSelectorProps {
  options: any[];
  isMultiple?: boolean;
  isSelectAll?: boolean;
  onSelected: (value: any) => void;
}

const MultiSelector: React.FC<MultiSelectorProps> = ({
  options,
  isMultiple,
  isSelectAll = false,
  onSelected,
}) => {
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [selectAllChecked, setSelectAllChecked] = useState(false);

  // Remove selected option from options list
  const filteredOptions = options?.filter((option) => !selectedColumns.includes(option));

  const handleColumnSelect = (value: string) => {
    if (!selectedColumns.includes(value)) {
      const updatedColumns = isMultiple ? [...selectedColumns, value] : [value];
      setSelectedColumns(updatedColumns);
      onSelected(updatedColumns);
    }
  };

  const handleColumnRemove = (value: string) => {
    const updatedColumns = selectedColumns?.filter((col) => col !== value);
    setSelectedColumns(updatedColumns);
    onSelected(updatedColumns);
  };

  // Handle select all/deselect all logic
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      // Select all columns
      setSelectedColumns(options);
      onSelected(options);
    } else {
      // Deselect all columns
      setSelectedColumns([]);
      onSelected([]);
    }
    setSelectAllChecked(checked); // Update the checkbox state
  };

  return (
    <div className="w-full flex flex-col">
      <div className="w-full flex flex-wrap gap-2 mb-2">
        {selectedColumns.map((item) => (
          <span
            key={item}
            className="bg-gray-100 dark:bg-gray-900 py-2 px-4 rounded-md flex gap-2 items-center">
            {item}
            <X
              size={16}
              className="text-red-500 cursor-pointer"
              onClick={() => handleColumnRemove(item)}
            />
          </span>
        ))}
      </div>
      <Select onValueChange={handleColumnSelect} value="">
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select options" />
        </SelectTrigger>
        <SelectContent>
          {filteredOptions?.map((item, index) => (
            <SelectItem key={index} value={item}>
              {item}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {isSelectAll && (
        <div className="flex items-center space-x-2 mt-4">
          <Checkbox
            id="selectall"
            name="selectAll"
            onCheckedChange={handleSelectAll}
            checked={selectAllChecked}
          />
          <label htmlFor="selectall" className="text-sm font-medium leading-none">
            Select all columns
          </label>
        </div>
      )}
    </div>
  );
};

export default MultiSelector;
