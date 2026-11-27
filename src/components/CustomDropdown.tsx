import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface DropdownOption {
  value: string;
  label: string;
  group?: string;
  badge?: string;
}

interface CustomDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
  icon?: React.ReactNode;
  labelPrefix?: string;
  placeholder?: string;
  className?: string;
  menuClassName?: string;
  buttonClassName?: string;
}

export const CustomDropdown: React.FC<CustomDropdownProps> = ({
  value,
  onChange,
  options,
  icon,
  labelPrefix,
  placeholder = 'Select option',
  className = '',
  menuClassName = '',
  buttonClassName = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close when clicking or tapping outside the dropdown
  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: PointerEvent | MouseEvent | TouchEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const selectedOption = options.find((opt) => opt.value === value);

  // Group options if group is provided
  const groupedOptions = options.reduce<Record<string, DropdownOption[]>>((acc, option) => {
    const groupName = option.group || 'default';
    if (!acc[groupName]) {
      acc[groupName] = [];
    }
    acc[groupName].push(option);
    return acc;
  }, {});

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className={`flex items-center justify-between gap-2 px-3 py-2 text-xs font-semibold text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-2xs active:scale-98 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 ${buttonClassName}`}
      >
        <div className="flex items-center gap-1.5 min-w-0">
          {icon}
          {labelPrefix && <span className="text-slate-500 font-medium">{labelPrefix}:</span>}
          <span className="truncate max-w-[180px] font-bold text-slate-900">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-emerald-600' : ''
          }`}
        />
      </button>

      {/* Floating Menu with Click-Outside Protection */}
      {isOpen && (
        <div
          role="listbox"
          className={`absolute left-0 mt-1.5 w-64 max-h-72 overflow-y-auto bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-fade-in focus:outline-hidden text-xs ${menuClassName}`}
        >
          {Object.entries(groupedOptions).map(([groupName, groupItems], groupIdx) => (
            <div key={groupName}>
              {groupName !== 'default' && (
                <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/80 border-y border-slate-100 first:border-t-0">
                  {groupName}
                </div>
              )}
              {groupItems.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-left transition-colors ${
                      isSelected
                        ? 'bg-emerald-50 text-emerald-900 font-bold'
                        : 'text-slate-700 hover:bg-slate-50 font-medium'
                    }`}
                  >
                    <span className="truncate">{opt.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 ml-2" />}
                  </button>
                );
              })}
              {groupIdx < Object.keys(groupedOptions).length - 1 && groupName === 'default' && (
                <div className="border-b border-slate-100 my-1" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
