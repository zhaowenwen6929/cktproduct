import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Layers, 
  X, 
  ChevronDown, 
  ChevronRight, 
  Eye, 
  EyeOff, 
  Lock, 
  Unlock, 
  MoreHorizontal, 
  GripVertical,
  Layout,
  Box,
  Image as ImageIcon,
  Type,
  Shapes,
  Sparkles,
  Video,
  Copy,
  Download,
  Trash2,
  ArrowUp,
  ArrowDown,
  ChevronsUp,
  ChevronsDown,
  Merge,
  Ungroup
} from 'lucide-react';
import { CanvasObject } from '../types';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface LayerPanelProps {
  objects: CanvasObject[];
  selectedIds: string[];
  onSelect: (id: string | null, isMulti?: boolean) => void;
  onUpdate: (id: string, updates: Partial<CanvasObject>) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onExport: (id: string) => void;
  onReorder: (newObjects: CanvasObject[]) => void;
  onClose: () => void;
  onGroup: () => void;
  onCreateArtboard: () => void;
  onCancelArtboard: (id: string) => void;
  onMergeLayers: () => void;
}

const LayerContextMenu = ({ x, y, onClose, onAction, isMultiSelect }: any) => {
  return (
    <div 
      className="fixed bg-white rounded-xl shadow-2xl border border-gray-100 py-1.5 w-48 z-[100] animate-in fade-in zoom-in-95 duration-100"
      style={{ left: x, top: y }}
      onMouseLeave={onClose}
    >
      <button onClick={() => { onAction('duplicate'); onClose(); }} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
        <Copy size={14} className="text-gray-400" /> 复制/粘贴
      </button>
      <div className="h-px bg-gray-50 my-1" />
      <button onClick={() => { onAction('move-up'); onClose(); }} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
        <ArrowUp size={14} className="text-gray-400" /> 上移一层
      </button>
      <button onClick={() => { onAction('move-down'); onClose(); }} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
        <ArrowDown size={14} className="text-gray-400" /> 下移一层
      </button>
      <button onClick={() => { onAction('bring-to-front'); onClose(); }} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
        <ChevronsUp size={14} className="text-gray-400" /> 置于顶层
      </button>
      <button onClick={() => { onAction('send-to-back'); onClose(); }} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
        <ChevronsDown size={14} className="text-gray-400" /> 置于底层
      </button>
      <div className="h-px bg-gray-50 my-1" />
      {isMultiSelect && (
        <>
          <button onClick={() => { onAction('merge'); onClose(); }} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
            <Merge size={14} className="text-gray-400" /> 合并图层
          </button>
          <button onClick={() => { onAction('group'); onClose(); }} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
            <Box size={14} className="text-gray-400" /> 组合
          </button>
          <button onClick={() => { onAction('create-frame'); onClose(); }} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
            <Layout size={14} className="text-gray-400" /> 创建画板
          </button>
          <div className="h-px bg-gray-50 my-1" />
        </>
      )}
      <button onClick={() => { onAction('export'); onClose(); }} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
        <Download size={14} className="text-gray-400" /> 导出
      </button>
      <button onClick={() => { onAction('delete'); onClose(); }} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors">
        <Trash2 size={14} className="text-red-400" /> 删除
      </button>
    </div>
  );
};

const SortableLayerItem = ({ 
  obj, 
  isSelected, 
  onSelect, 
  onUpdate, 
  onDelete, 
  onDuplicate, 
  onExport,
  onContextMenu,
  isChild = false
}: { 
  obj: CanvasObject; 
  isSelected: boolean;
  onSelect: (id: string, isMulti?: boolean) => void;
  onUpdate: (id: string, updates: Partial<CanvasObject>) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onExport: (id: string) => void;
  onContextMenu: (e: React.MouseEvent, id: string) => void;
  isChild?: boolean;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: obj.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 0,
    opacity: obj.hidden ? 0.5 : 1,
  };

  const getIcon = () => {
    switch (obj.type) {
      case 'frame': return <Layout size={14} />;
      case 'group': return <Box size={14} />;
      case 'image': return <ImageIcon size={14} />;
      case 'text': return <Type size={14} />;
      case 'shape': return <Shapes size={14} />;
      case 'video': return <Video size={14} />;
      case 'image-generator': return <Sparkles size={14} />;
      default: return <Box size={14} />;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors relative",
        isSelected ? "bg-[#5c5cfc]/10" : "hover:bg-gray-50",
        isChild && "pl-8"
      )}
      onClick={(e) => onSelect(obj.id, e.shiftKey || e.metaKey || e.ctrlKey)}
      onContextMenu={(e) => onContextMenu(e, obj.id)}
    >
      <div {...attributes} {...listeners} className="opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing text-gray-400">
        <GripVertical size={14} />
      </div>
      
      <div className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center text-gray-500 overflow-hidden">
        {obj.type === 'image' && obj.content ? (
          <img src={obj.content} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        ) : getIcon()}
      </div>

      <span className={cn(
        "text-[13px] flex-1 truncate",
        isSelected ? "text-[#5c5cfc] font-medium" : "text-gray-700"
      )}>
        {obj.name || obj.content || obj.type}
      </span>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={(e) => { e.stopPropagation(); onUpdate(obj.id, { hidden: !obj.hidden }); }}
          className="p-1 hover:bg-gray-200 rounded text-gray-500"
        >
          {obj.hidden ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); onUpdate(obj.id, { locked: !obj.locked }); }}
          className="p-1 hover:bg-gray-200 rounded text-gray-500"
        >
          {obj.locked ? <Lock size={14} /> : <Unlock size={14} />}
        </button>
      </div>
    </div>
  );
};

export const LayerPanel: React.FC<LayerPanelProps> = ({ 
  objects, 
  selectedIds, 
  onSelect, 
  onUpdate, 
  onDelete, 
  onDuplicate, 
  onExport,
  onReorder,
  onClose,
  onGroup,
  onCreateArtboard,
  onCancelArtboard,
  onMergeLayers
}) => {
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, id: string } | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleContextMenu = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, id });
    if (!selectedIds.includes(id)) {
      onSelect(id);
    }
  };

  const handleAction = (action: string) => {
    if (!contextMenu) return;
    const id = contextMenu.id;

    switch (action) {
      case 'duplicate': onDuplicate(id); break;
      case 'delete': onDelete(id); break;
      case 'export': onExport(id); break;
      case 'move-up': {
        const idx = objects.findIndex(o => o.id === id);
        if (idx < objects.length - 1) {
          const newObjects = [...objects];
          [newObjects[idx], newObjects[idx + 1]] = [newObjects[idx + 1], newObjects[idx]];
          onReorder(newObjects);
        }
        break;
      }
      case 'move-down': {
        const idx = objects.findIndex(o => o.id === id);
        if (idx > 0) {
          const newObjects = [...objects];
          [newObjects[idx], newObjects[idx - 1]] = [newObjects[idx - 1], newObjects[idx]];
          onReorder(newObjects);
        }
        break;
      }
      case 'bring-to-front': {
        const idx = objects.findIndex(o => o.id === id);
        const newObjects = [...objects];
        const [item] = newObjects.splice(idx, 1);
        newObjects.push(item);
        onReorder(newObjects);
        break;
      }
      case 'send-to-back': {
        const idx = objects.findIndex(o => o.id === id);
        const newObjects = [...objects];
        const [item] = newObjects.splice(idx, 1);
        newObjects.unshift(item);
        onReorder(newObjects);
        break;
      }
      case 'merge': onMergeLayers(); break;
      case 'group': onGroup(); break;
      case 'create-frame': onCreateArtboard(); break;
      case 'cancel-frame': onCancelArtboard(id); break;
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = objects.findIndex((obj) => obj.id === active.id);
      const newIndex = objects.findIndex((obj) => obj.id === over.id);
      onReorder(arrayMove(objects, oldIndex, newIndex));
    }
  };

  // Group objects by artboard (frame)
  const layerStructure = useMemo(() => {
    const frames = objects.filter(obj => obj.type === 'frame');
    const standalone = objects.filter(obj => obj.type !== 'frame' && !obj.parentId);
    
    return [
      ...frames.map(frame => ({
        ...frame,
        children: objects.filter(obj => obj.parentId === frame.id)
      })),
      ...standalone
    ];
  }, [objects]);

  return (
    <motion.div 
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -300, opacity: 0 }}
      className="absolute left-4 bottom-16 w-[260px] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden z-50"
      style={{ maxHeight: 'calc(100vh - 200px)' }}
    >
      <div className="p-4 border-b border-gray-50 flex items-center justify-between bg-white sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <Layers size={18} className="text-gray-400" />
          <h3 className="font-bold text-[15px] text-gray-800">图层</h3>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full text-gray-400 transition-colors">
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext 
            items={objects.map(o => o.id)}
            strategy={verticalListSortingStrategy}
          >
            {layerStructure.map((item: any) => (
              <div key={item.id} className="border-b border-gray-50 last:border-0">
                {item.type === 'frame' ? (
                  <div className="sticky top-0 bg-white z-[5] shadow-sm">
                    <div 
                      className={cn(
                        "group flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-50 transition-colors",
                        selectedIds.includes(item.id) && "bg-[#5c5cfc]/5"
                      )}
                      onClick={(e) => onSelect(item.id, e.shiftKey || e.metaKey || e.ctrlKey)}
                    >
                      <ChevronDown size={14} className="text-gray-400" />
                      <Layout size={14} className="text-gray-400" />
                      <span className="text-[13px] font-bold text-gray-800 flex-1 truncate">
                        {item.name || item.content || '画板'}
                      </span>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={(e) => { e.stopPropagation(); onUpdate(item.id, { hidden: !item.hidden }); }}
                          className="p-1 hover:bg-gray-200 rounded text-gray-500"
                        >
                          {item.hidden ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                        <div className="relative group/more">
                          <button className="p-1 hover:bg-gray-200 rounded text-gray-500">
                            <MoreHorizontal size={14} />
                          </button>
                          <div className="absolute right-0 top-full mt-1 w-32 bg-white rounded-lg shadow-xl border border-gray-100 py-1 z-50 hidden group-hover/more:block">
                            <button 
                              onClick={(e) => { e.stopPropagation(); onDuplicate(item.id); }}
                              className="w-full text-left px-3 py-1.5 text-[12px] hover:bg-gray-50 flex items-center gap-2"
                            >
                              <Copy size={12} /> 复制画板
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); onExport(item.id); }}
                              className="w-full text-left px-3 py-1.5 text-[12px] hover:bg-gray-50 flex items-center gap-2"
                            >
                              <Download size={12} /> 导出画板
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); onUpdate(item.id, { hidden: !item.hidden }); }}
                              className="w-full text-left px-3 py-1.5 text-[12px] hover:bg-gray-50 flex items-center gap-2"
                            >
                              {item.hidden ? <Eye size={12} /> : <EyeOff size={12} />} {item.hidden ? '展示画板' : '隐藏画板'}
                            </button>
                            <div className="h-px bg-gray-50 my-1" />
                            <button 
                              onClick={(e) => { e.stopPropagation(); if(confirm('确定删除画板吗？')) onDelete(item.id); }}
                              className="w-full text-left px-3 py-1.5 text-[12px] hover:bg-gray-50 text-red-500 flex items-center gap-2"
                            >
                              <Trash2 size={12} /> 删除画板
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50/30">
                      {item.children.map((child: CanvasObject) => (
                        <SortableLayerItem 
                          key={child.id}
                          obj={child}
                          isSelected={selectedIds.includes(child.id)}
                          onSelect={onSelect}
                          onUpdate={onUpdate}
                          onDelete={onDelete}
                          onDuplicate={onDuplicate}
                          onExport={onExport}
                          onContextMenu={handleContextMenu}
                          isChild
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <SortableLayerItem 
                    obj={item}
                    isSelected={selectedIds.includes(item.id)}
                    onSelect={onSelect}
                    onUpdate={onUpdate}
                    onDelete={onDelete}
                    onDuplicate={onDuplicate}
                    onExport={onExport}
                    onContextMenu={handleContextMenu}
                  />
                )}
              </div>
            ))}
          </SortableContext>
        </DndContext>
      </div>

        {contextMenu && (
          <LayerContextMenu 
            x={contextMenu.x} 
            y={contextMenu.y} 
            onClose={() => setContextMenu(null)}
            onAction={handleAction}
            isMultiSelect={selectedIds.length > 1}
          />
        )}
    </motion.div>
  );
};
