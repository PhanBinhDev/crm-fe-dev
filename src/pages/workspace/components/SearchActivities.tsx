import React, { useState, useRef, useCallback, useEffect } from 'react';
import { IconSearch, IconX } from '@tabler/icons-react';
import { Input, InputRef, Tooltip } from 'antd';
import { useDebounce } from '@/hooks/useDebounce';

interface SearchActivitiesProps {
  placeholder?: string;
  onSearch?: (value: string) => void;
  onClear?: () => void;
  className?: string;
  disabled?: boolean;
}

const SearchActivities: React.FC<SearchActivitiesProps> = ({
  placeholder = 'Tìm kiếm hoạt động...',
  onSearch,
  onClear,
  className = '',
  disabled = false,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const inputRef = useRef<InputRef>(null);
  const debouncedValue = useDebounce(searchTerm, 300);

  useEffect(() => {
    onSearch?.(debouncedValue);
  }, [debouncedValue, onSearch]);

  const handleExpand = useCallback(() => {
    if (disabled) return;
    setExpanded(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [disabled]);

  const handleCollapse = useCallback(() => {
    if (!searchTerm.trim()) {
      setExpanded(false);
    }
  }, [searchTerm]);

  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);

  const handleClear = useCallback(() => {
    setSearchTerm('');
    setExpanded(false);
    onClear?.();
    inputRef.current?.blur();
  }, [onClear]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (searchTerm) {
          handleClear();
        } else {
          handleCollapse();
        }
      }
    },
    [searchTerm, handleClear, handleCollapse],
  );

  return (
    <div
      className={`search-activities ${className}`}
      style={{
        position: 'relative',
        width: expanded ? 260 : 36,
        height: 36,
        transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {/* Main Input */}
      <Input
        ref={inputRef}
        placeholder={expanded ? placeholder : ''}
        value={searchTerm}
        onChange={e => handleSearch(e.target.value)}
        onFocus={handleExpand}
        onBlur={handleCollapse}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        style={{
          width: '100%',
          height: 36,
          paddingLeft: expanded ? 36 : 12,
          paddingRight: expanded && searchTerm ? 36 : 12,
          fontSize: 14,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          cursor: expanded ? 'text' : 'pointer',
          background: expanded ? '#fff' : '#f5f5f5',
          borderColor: expanded ? '#1890ff' : '#d9d9d9',
          borderRadius: 8,
          boxShadow: expanded ? '0 2px 8px rgba(24, 144, 255, 0.15)' : '0 1px 2px rgba(0,0,0,0.04)',
        }}
      />

      {/* Search Icon */}
      <div
        style={{
          position: 'absolute',
          left: expanded ? 12 : 10,
          top: '50%',
          transform: 'translateY(-50%)',
          cursor: expanded ? 'default' : 'pointer',
          zIndex: 2,
          transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          color: expanded ? '#1890ff' : '#8c8c8c',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onClick={!expanded ? handleExpand : undefined}
      >
        <IconSearch size={16} />
      </div>

      {/* Clear Button */}
      {expanded && searchTerm && (
        <div
          style={{
            position: 'absolute',
            right: 10,
            top: '50%',
            transform: 'translateY(-50%)',
            cursor: 'pointer',
            zIndex: 2,
            color: '#8c8c8c',
            transition: 'color 0.2s ease',
            padding: 2,
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={handleClear}
          onMouseEnter={e => {
            e.currentTarget.style.color = '#ff4d4f';
            e.currentTarget.style.backgroundColor = 'rgba(255, 77, 79, 0.1)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = '#8c8c8c';
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <IconX size={14} />
        </div>
      )}

      {/* Loading state (optional) */}
      {/* {loading && expanded && (
        <div
          style={{
            position: 'absolute',
            right: 16,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 2,
          }}
        >
          <Spin size="small" />
        </div>
      )} */}
    </div>
  );
};

export default SearchActivities;
