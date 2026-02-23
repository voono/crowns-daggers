import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Swords, Shield, Handshake, Tent, Crown, ChevronRight, AlertCircle, Castle, Sparkles, Users, Map as MapIcon, ScrollText, History, X, Check } from 'lucide-react';

// --- GAME CONFIGURATION & CONSTANTS ---
const PLAYERS = {
  p1: { id: 'p1', name: 'House Stag', color: 'bg-yellow-500', border: 'border-yellow-600', text: 'text-yellow-500', powerName: 'Ours is the Fury', powerDesc: '+1 Unit upon successfully conquering.' },
  p2: { id: 'p2', name: 'House Wolf', color: 'bg-stone-300', border: 'border-stone-500', text: 'text-stone-300', powerName: 'Winter is Coming', powerDesc: '+1 Strength to Defend orders.' },
  p3: { id: 'p3', name: 'House Dragon', color: 'bg-red-600', border: 'border-red-800', text: 'text-red-500', powerName: 'Fire and Blood', powerDesc: 'Innate +1 Strength to all Attacks.' },
  p4: { id: 'p4', name: 'House Kraken', color: 'bg-teal-600', border: 'border-teal-800', text: 'text-teal-500', powerName: 'Iron Fleet', powerDesc: '+1 Strength to Support orders.' },
};

const NEUTRAL_COLOR = 'bg-stone-700';
const NEUTRAL_BORDER = 'border-stone-800';

const GAME_EVENTS = {
  CLEAR_SKIES: { id: 'CLEAR_SKIES', name: 'Clear Skies', desc: 'No special rules this turn. Standard warfare applies.', icon: '🌤️' },
  HARSH_WINTER: { id: 'HARSH_WINTER', name: 'Harsh Winter', desc: 'The cold bites. Muster orders cannot be played this turn.', icon: '❄️' },
  FOG_OF_WAR: { id: 'FOG_OF_WAR', name: 'Fog of War', desc: 'Communication is lost. Support orders cannot be played this turn.', icon: '🌫️' },
  BOUNTIFUL_HARVEST: { id: 'BOUNTIFUL_HARVEST', name: 'Bountiful Harvest', desc: 'Plentiful food. Muster orders grant +2 units instead of +1.', icon: '🌾' },
  REBELLION: { id: 'REBELLION', name: 'Rebellion', desc: 'The smallfolk rise. All Neutral territories gain +1 Defense this turn.', icon: '🔥' }
};
const EVENT_KEYS = Object.keys(GAME_EVENTS);

// Map configurations - coordinate grid is based on a 1000x1000 plane mapping to percentages
const MAP_CONFIGS = {
  2: {
    winCondition: 5,
    nodes: {
      t1: { id: 't1', name: 'Winterfell', x: 20, y: 20, connections: ['t2', 't3', 't5'], isCastle: true },
      t2: { id: 't2', name: 'The Neck', x: 50, y: 20, connections: ['t1', 't4', 't5'] },
      t3: { id: 't3', name: 'The Iron Islands', x: 15, y: 50, connections: ['t1', 't5', 't7'] },
      t4: { id: 't4', name: 'The Vale', x: 85, y: 50, connections: ['t2', 't5', 't6'] },
      t5: { id: 't5', name: 'The Throne', x: 50, y: 50, connections: ['t1', 't2', 't3', 't4', 't6', 't7', 't8'], isCastle: true },
      t6: { id: 't6', name: 'The Crownlands', x: 80, y: 80, connections: ['t4', 't5', 't8'] },
      t7: { id: 't7', name: 'The Reach', x: 20, y: 80, connections: ['t3', 't5', 't8'], isCastle: true },
      t8: { id: 't8', name: 'Storm\'s End', x: 50, y: 80, connections: ['t5', 't6', 't7'], isCastle: true },
    },
    initial: {
      t1: { ownerId: 'p2', units: 4 }, t2: { ownerId: null, units: 1 }, t3: { ownerId: null, units: 1 },
      t4: { ownerId: null, units: 1 }, t5: { ownerId: null, units: 3 }, t6: { ownerId: null, units: 1 },
      t7: { ownerId: null, units: 1 }, t8: { ownerId: 'p1', units: 4 },
    }
  },
  3: {
    winCondition: 6,
    nodes: {
      t1: { id: 't1', name: 'Frozen Wastes', x: 15, y: 15, connections: ['t3', 't8', 't12'] },
      t2: { id: 't2', name: 'High Peaks', x: 85, y: 15, connections: ['t5', 't9', 't12'] },
      t3: { id: 't3', name: 'Riverlands', x: 25, y: 35, connections: ['t1', 't8', 't12', 't4', 't10'] },
      t4: { id: 't4', name: 'The Throne', x: 50, y: 55, connections: ['t3', 't12', 't5', 't10', 't11'], isCastle: true }, 
      t5: { id: 't5', name: 'Deep Forest', x: 75, y: 35, connections: ['t2', 't9', 't12', 't4', 't11'] },
      t6: { id: 't6', name: 'Golden Coast', x: 15, y: 85, connections: ['t8', 't10'] },
      t7: { id: 't7', name: 'Sunken Desert', x: 85, y: 85, connections: ['t9', 't11'] },
      t8: { id: 't8', name: 'Iron Isles', x: 10, y: 55, connections: ['t1', 't3', 't6'], isCastle: true },
      t9: { id: 't9', name: 'The Vale', x: 90, y: 55, connections: ['t2', 't5', 't7'], isCastle: true },
      t10: { id: 't10', name: 'The Reach', x: 30, y: 75, connections: ['t6', 't3', 't4', 't11'], isCastle: true },
      t11: { id: 't11', name: 'Stormlands', x: 70, y: 75, connections: ['t7', 't5', 't4', 't10'] },
      t12: { id: 't12', name: 'Crownlands', x: 50, y: 25, connections: ['t1', 't2', 't3', 't5', 't4'] },
    },
    initial: {
      t1: { ownerId: 'p2', units: 3 }, t2: { ownerId: null, units: 1 }, t3: { ownerId: null, units: 1 },
      t4: { ownerId: null, units: 3 }, t5: { ownerId: null, units: 1 }, t6: { ownerId: 'p3', units: 3 },
      t7: { ownerId: 'p1', units: 3 }, t8: { ownerId: null, units: 1 }, t9: { ownerId: null, units: 1 },
      t10: { ownerId: null, units: 1 }, t11: { ownerId: null, units: 1 }, t12: { ownerId: null, units: 2 }, 
    }
  },
  4: {
    winCondition: 6,
    nodes: {
      t1: { id: 't1', name: 'Frozen Wastes', x: 15, y: 15, connections: ['t3', 't8', 't15'], isCastle: true },
      t2: { id: 't2', name: 'High Peaks', x: 85, y: 15, connections: ['t5', 't9', 't15'], isCastle: true },
      t3: { id: 't3', name: 'Riverlands', x: 30, y: 35, connections: ['t1', 't8', 't12', 't4', 't10'] },
      t4: { id: 't4', name: 'The Throne', x: 50, y: 50, connections: ['t3', 't12', 't5', 't10', 't11'], isCastle: true },
      t5: { id: 't5', name: 'Deep Forest', x: 70, y: 35, connections: ['t2', 't9', 't12', 't4', 't11'] },
      t6: { id: 't6', name: 'Golden Coast', x: 15, y: 80, connections: ['t8', 't10', 't13'], isCastle: true },
      t7: { id: 't7', name: 'Sunken Desert', x: 85, y: 80, connections: ['t9', 't11', 't14'], isCastle: true },
      t8: { id: 't8', name: 'Iron Isles', x: 10, y: 50, connections: ['t1', 't3', 't6', 't13'] },
      t9: { id: 't9', name: 'The Vale', x: 90, y: 50, connections: ['t2', 't5', 't7', 't16'] },
      t10: { id: 't10', name: 'The Reach', x: 35, y: 65, connections: ['t6', 't3', 't4', 't11', 't14'] },
      t11: { id: 't11', name: 'Stormlands', x: 65, y: 65, connections: ['t7', 't5', 't4', 't10', 't14'] },
      t12: { id: 't12', name: 'Crownlands', x: 50, y: 30, connections: ['t15', 't3', 't5', 't4'] },
      t13: { id: 't13', name: 'Western Isles', x: 5, y: 65, connections: ['t8', 't6'] }, 
      t14: { id: 't14', name: 'Dorne', x: 50, y: 85, connections: ['t10', 't11', 't7', 't6'] }, 
      t15: { id: 't15', name: 'Shivering Sea', x: 50, y: 15, connections: ['t1', 't2', 't12'] },
      t16: { id: 't16', name: 'Narrow Sea', x: 95, y: 65, connections: ['t9', 't7'] },
    },
    initial: {
      t1: { ownerId: 'p2', units: 3 }, t2: { ownerId: 'p3', units: 3 }, t3: { ownerId: null, units: 1 },
      t4: { ownerId: null, units: 3 }, t5: { ownerId: null, units: 1 }, t6: { ownerId: 'p4', units: 3 },
      t7: { ownerId: 'p1', units: 3 }, t8: { ownerId: null, units: 1 }, t9: { ownerId: null, units: 1 },
      t10: { ownerId: null, units: 1 }, t11: { ownerId: null, units: 1 }, t12: { ownerId: null, units: 2 },
      t13: { ownerId: null, units: 1 }, t14: { ownerId: null, units: 2 }, t15: { ownerId: null, units: 1 },
      t16: { ownerId: null, units: 1 },
    }
  }
};

// --- SUB-COMPONENTS ---

// A hook to handle multi-touch panning and pinch-to-zoom
const usePanZoom = (containerRef) => {
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const pinchStartDist = useRef(null);
  const pinchStartScale = useRef(null);

  // Center map initially based on screen size
  useEffect(() => {
    if (!containerRef.current) return;
    const { clientWidth, clientHeight } = containerRef.current;
    const initialScale = Math.min(clientWidth / 1200, clientHeight / 1200) * 0.9; 
    setTransform({
      x: (clientWidth - 1000 * initialScale) / 2,
      y: (clientHeight - 1000 * initialScale) / 2,
      scale: Math.max(0.4, initialScale)
    });
  }, [containerRef]);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const handleTouchStart = (e) => {
      e.preventDefault(); // Stop native scrolling
      if (e.touches.length === 1) {
        isDragging.current = true;
        dragStart.current = {
          x: e.touches[0].clientX - transform.x,
          y: e.touches[0].clientY - transform.y
        };
      } else if (e.touches.length === 2) {
        isDragging.current = false;
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        pinchStartDist.current = dist;
        pinchStartScale.current = transform.scale;
      }
    };

    const handleTouchMove = (e) => {
      e.preventDefault();
      if (e.touches.length === 1 && isDragging.current) {
        setTransform(prev => ({
          ...prev,
          x: e.touches[0].clientX - dragStart.current.x,
          y: e.touches[0].clientY - dragStart.current.y
        }));
      } else if (e.touches.length === 2 && pinchStartDist.current) {
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        const scaleFactor = dist / pinchStartDist.current;
        const newScale = Math.min(Math.max(0.3, pinchStartScale.current * scaleFactor), 3);
        setTransform(prev => ({ ...prev, scale: newScale }));
      }
    };

    const handleTouchEnd = () => {
      isDragging.current = false;
      pinchStartDist.current = null;
    };

    // Mouse support
    const handleMouseDown = (e) => {
      isDragging.current = true;
      dragStart.current = { x: e.clientX - transform.x, y: e.clientY - transform.y };
    };
    const handleMouseMove = (e) => {
      if (!isDragging.current) return;
      setTransform(prev => ({
        ...prev, x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y
      }));
    };
    const handleMouseUp = () => isDragging.current = false;
    const handleWheel = (e) => {
      e.preventDefault();
      const scaleAdj = e.deltaY > 0 ? 0.9 : 1.1;
      setTransform(prev => ({ ...prev, scale: Math.min(Math.max(0.3, prev.scale * scaleAdj), 3) }));
    };

    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd);
    element.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    element.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      element.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      element.removeEventListener('wheel', handleWheel);
    };
  }, [transform, containerRef]);

  return transform;
};

// Bottom Drawer Action Sheet for Mobile
const OrderDrawer = ({ 
  selectedNode, pendingAction, territories, mapNodes, currentPlayerId, currentEvent,
  onSetPendingAction, onSetOrder, onCancel
}) => {
  if (!selectedNode) return null;
  const nodeInfo = mapNodes[selectedNode];
  const tState = territories[selectedNode];
  const owner = tState.ownerId ? PLAYERS[tState.ownerId] : null;
  const isOwner = tState.ownerId === currentPlayerId;

  const canMuster = currentEvent.id !== 'HARSH_WINTER';
  const canSupport = currentEvent.id !== 'FOG_OF_WAR';

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-stone-900 border-t-2 border-stone-700 rounded-t-3xl p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] z-50 animate-slide-up pb-safe">
      
      {/* Drawer Handle */}
      <div className="w-12 h-1.5 bg-stone-700 rounded-full mx-auto mb-4" />

      {/* Target Selection Mode */}
      {pendingAction ? (
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
             <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  {pendingAction === 'MARCH' ? <Swords className="text-red-500"/> : <Handshake className="text-blue-500"/>}
                  Select Target
                </h3>
                <p className="text-stone-400 text-sm">Tap an adjacent, pulsing territory.</p>
             </div>
             <button onClick={onCancel} className="p-2 bg-stone-800 rounded-full text-stone-400 hover:text-white">
                <X size={24} />
             </button>
          </div>
        </div>
      ) : (
        /* Action Selection Mode */
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center mb-2">
            <div>
              <h3 className="text-2xl font-black text-white">{nodeInfo.name}</h3>
              <div className="flex items-center gap-2 text-sm mt-1">
                <span className={`px-2 py-0.5 rounded text-xs font-bold ${owner ? owner.color + ' text-stone-900' : 'bg-stone-700 text-stone-300'}`}>
                  {owner ? owner.name : 'Neutral'}
                </span>
                <span className="text-stone-400">{tState.units} Units</span>
              </div>
            </div>
            <button onClick={onCancel} className="p-2 bg-stone-800 rounded-full text-stone-400 hover:text-white">
               <X size={24} />
            </button>
          </div>

          {isOwner ? (
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => onSetPendingAction('MARCH')} className="flex flex-col items-center justify-center p-4 bg-stone-800 rounded-xl border border-stone-700 hover:bg-stone-700 hover:border-red-500 transition-colors active:scale-95 group">
                <Swords size={32} className="text-red-500 mb-2 group-hover:scale-110 transition-transform" />
                <span className="font-bold text-stone-200">March / Attack</span>
              </button>
              
              <button onClick={() => { onSetOrder('DEFEND'); onCancel(); }} className="flex flex-col items-center justify-center p-4 bg-stone-800 rounded-xl border border-stone-700 hover:bg-stone-700 hover:border-green-500 transition-colors active:scale-95 group">
                <Shield size={32} className="text-green-500 mb-2 group-hover:scale-110 transition-transform" />
                <span className="font-bold text-stone-200">Defend</span>
              </button>

              <button 
                onClick={() => canSupport ? onSetPendingAction('SUPPORT') : null} 
                className={`flex flex-col items-center justify-center p-4 bg-stone-800 rounded-xl border border-stone-700 transition-colors active:scale-95 group ${!canSupport ? 'opacity-40 cursor-not-allowed' : 'hover:bg-stone-700 hover:border-blue-500'}`}
              >
                <Handshake size={32} className="text-blue-500 mb-2 group-hover:scale-110 transition-transform" />
                <span className="font-bold text-stone-200">Support</span>
              </button>

              <button 
                onClick={() => canMuster ? (() => { onSetOrder('MUSTER'); onCancel(); })() : null} 
                className={`flex flex-col items-center justify-center p-4 bg-stone-800 rounded-xl border border-stone-700 transition-colors active:scale-95 group ${!canMuster ? 'opacity-40 cursor-not-allowed' : 'hover:bg-stone-700 hover:border-yellow-500'}`}
              >
                <Tent size={32} className="text-yellow-500 mb-2 group-hover:scale-110 transition-transform" />
                <span className="font-bold text-stone-200">Muster</span>
              </button>
            </div>
          ) : (
            <div className="bg-stone-800/50 p-4 rounded-xl text-center border border-stone-700/50">
               <p className="text-stone-400">You do not control this territory.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};


// Main Immersive Map Viewer
const FullScreenMap = ({ 
  interactive = false, currentPlayerId = null, showAllOrders = false, territories, orders, 
  setOrders, selectedNode, setSelectedNode, pendingAction, setPendingAction, mapData, currentEvent
}) => {
  const containerRef = useRef(null);
  const transform = usePanZoom(containerRef);

  const getNeighbors = (id) => mapData[id].connections;

  const handleNodeClick = (nodeId) => {
    if (!interactive) return;

    const nodeState = territories[nodeId];
    
    // If waiting to target something for Attack/Support
    if (pendingAction && selectedNode) {
      if (getNeighbors(selectedNode).includes(nodeId)) {
        setOrders(prev => ({ ...prev, [selectedNode]: { type: pendingAction, targetId: nodeId } }));
        setPendingAction(null);
        setSelectedNode(null);
      }
      return;
    }

    // Otherwise select the territory (whether we own it or not, to see info)
    setSelectedNode(selectedNode === nodeId ? null : nodeId);
    setPendingAction(null);
  };

  return (
    <div className="relative w-full h-full bg-stone-950 overflow-hidden touch-none" ref={containerRef}>
      
      {/* Transform Container */}
      <div 
        className="absolute top-0 left-0 w-[1000px] h-[1000px] origin-top-left will-change-transform"
        style={{ transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})` }}
      >
        {/* Background Texture / Grid (Optional visual aid) */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#444 2px, transparent 2px)', backgroundSize: '40px 40px' }} />

        {/* SVG Connections Layer */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {Object.values(mapData).map(node => (
            node.connections.map(targetId => {
              const target = mapData[targetId];
              if (node.id < targetId) {
                return (
                  <line key={`${node.id}-${targetId}`} x1={`${node.x}%`} y1={`${node.y}%`} x2={`${target.x}%`} y2={`${target.y}%`} stroke="#333" strokeWidth="4" strokeDasharray="8 6" className="opacity-60" />
                );
              }
              return null;
            })
          ))}
          
          {/* Order Action Lines (Arrows) */}
          {Object.entries(orders).map(([sourceId, order]) => {
            if (!showAllOrders && (!currentPlayerId || territories[sourceId].ownerId !== currentPlayerId)) return null;
            if (order.type === 'MARCH' || order.type === 'SUPPORT') {
              const source = mapData[sourceId];
              const target = mapData[order.targetId];
              const isSupport = order.type === 'SUPPORT';
              const isFriendly = order.type === 'MARCH' && territories[order.targetId].ownerId === territories[sourceId].ownerId;
              
              let strokeColor = "#ef4444"; // red 
              if (isSupport) strokeColor = "#3b82f6"; // blue
              else if (isFriendly) strokeColor = "#a8a29e"; // stone

              return (
                <line key={`order-${sourceId}`} x1={`${source.x}%`} y1={`${source.y}%`} x2={`${target.x}%`} y2={`${target.y}%`} stroke={strokeColor} strokeWidth="6" markerEnd="url(#arrowhead)" className="animate-pulse shadow-lg drop-shadow-md" />
              );
            }
            return null;
          })}
          <defs>
            <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill="#fff" opacity="0.8"/>
            </marker>
          </defs>
        </svg>

        {/* Node Layer */}
        {Object.values(mapData).map(node => {
          const tState = territories[node.id];
          const owner = tState.ownerId ? PLAYERS[tState.ownerId] : null;
          const isSelected = selectedNode === node.id;
          const isTargetable = pendingAction && selectedNode && getNeighbors(selectedNode).includes(node.id);
          const isCastle = node.isCastle;
          const nodeOrder = orders[node.id];
          const showOrder = Boolean(nodeOrder && (showAllOrders || (currentPlayerId && tState.ownerId === currentPlayerId)));
          
          // Dim non-targetable nodes during action selection
          const isDimmed = pendingAction && !isTargetable && selectedNode !== node.id;

          return (
            <div
              key={node.id}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300
                ${isTargetable ? 'scale-110 z-30 cursor-crosshair' : ''}
                ${isSelected ? 'scale-125 z-40' : 'z-20 hover:scale-105'}
                ${isDimmed ? 'opacity-30' : 'opacity-100'}
              `}
              style={{ left: `${node.x}%`, top: `${node.y}%` }}
              onClick={(e) => { e.stopPropagation(); handleNodeClick(node.id); }}
              onTouchEnd={(e) => { 
                // Prevent map pan from triggering click
                if (!containerRef.current.isDragging) handleNodeClick(node.id); 
              }}
            >
              {/* Territory Name Label */}
              <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 whitespace-nowrap text-sm font-black tracking-wide text-stone-300 bg-stone-900/90 px-3 py-1 rounded-md border border-stone-700/50 shadow-md backdrop-blur-sm">
                {node.name}
              </div>

              {isCastle && (
                 <div className="absolute -top-3 -left-3 bg-stone-800 rounded-full p-1.5 border-2 border-stone-600 shadow-xl z-30">
                    <Castle size={16} className="text-stone-300" />
                 </div>
              )}

              {/* The Node Circle */}
              <div className={`w-20 h-20 rounded-full border-4 flex items-center justify-center relative shadow-2xl transition-all
                ${owner ? owner.color : NEUTRAL_COLOR}
                ${owner ? owner.border : NEUTRAL_BORDER}
                ${isTargetable ? 'ring-8 ring-white/50 animate-pulse' : ''}
                ${isSelected ? 'ring-4 ring-yellow-400 shadow-[0_0_30px_rgba(250,204,21,0.6)]' : ''}
              `}>
                <span className="text-3xl font-black text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">{tState.units}</span>
                
                {/* Visual Order Token Indicator */}
                {showOrder && (
                  <div className="absolute -bottom-4 -right-4 w-10 h-10 bg-stone-900 rounded-full border-2 border-stone-400 flex items-center justify-center shadow-xl text-white z-30">
                    {nodeOrder.type === 'MARCH' && <Swords size={20} className="text-red-400"/>}
                    {nodeOrder.type === 'DEFEND' && <Shield size={20} className="text-green-400"/>}
                    {nodeOrder.type === 'SUPPORT' && <Handshake size={20} className="text-blue-400"/>}
                    {nodeOrder.type === 'MUSTER' && <Tent size={20} className="text-yellow-400"/>}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Drawer Overlay */}
      {interactive && (
        <OrderDrawer 
          selectedNode={selectedNode}
          pendingAction={pendingAction}
          territories={territories}
          mapNodes={mapData}
          currentPlayerId={currentPlayerId}
          currentEvent={currentEvent}
          onSetPendingAction={setPendingAction}
          onSetOrder={(type) => setOrders(prev => ({...prev, [selectedNode]: { type }}))}
          onCancel={() => { setPendingAction(null); setSelectedNode(null); }}
        />
      )}
    </div>
  );
};


// --- MAIN APPLICATION COMPONENT ---
export default function App() {
  const [playerCount, setPlayerCount] = useState(3);
  const [mapConfig, setMapConfig] = useState(MAP_CONFIGS[3]);

  // Core Game State
  const [phase, setPhase] = useState('TITLE'); // TITLE, WAR_ROOM, PASS, SECRET, REVEAL, GAME_OVER
  const [territories, setTerritories] = useState(MAP_CONFIGS[3].initial);
  const [turn, setTurn] = useState(1);
  const [logs, setLogs] = useState(["The war for the Throne begins!"]);
  const [winner, setWinner] = useState(null);
  const [currentEvent, setCurrentEvent] = useState(GAME_EVENTS.CLEAR_SKIES);

  // Turn State
  const [playerOrder, setPlayerOrder] = useState([]);
  const [currentPlayerIdx, setCurrentPlayerIdx] = useState(0);
  const [orders, setOrders] = useState({}); 

  // UI State for Secret Phase
  const [selectedNode, setSelectedNode] = useState(null);
  const [pendingAction, setPendingAction] = useState(null); 
  
  // Mobile Tab State for War Room
  const [activeTab, setActiveTab] = useState('map'); // 'map', 'intel', 'logs'

  // --- GAME LOOP LOGIC (Unchanged robust logic) ---

  const startGame = () => {
    const config = MAP_CONFIGS[playerCount];
    setMapConfig(config);
    setTerritories(config.initial);
    setTurn(1);
    setOrders({});
    setLogs(["The war for the Throne begins!"]);
    setWinner(null);
    setPhase('WAR_ROOM');
    
    const randomEvent = GAME_EVENTS[EVENT_KEYS[Math.floor(Math.random() * EVENT_KEYS.length)]];
    setCurrentEvent(randomEvent);
    const activePlayers = Object.keys(PLAYERS).slice(0, playerCount);
    setPlayerOrder(activePlayers.sort(() => Math.random() - 0.5));
  };

  const startOrdersPhase = () => {
    setCurrentPlayerIdx(0);
    setOrders({}); 
    setPhase('PASS');
  };

  const nextPlayerOrder = () => {
    setSelectedNode(null);
    setPendingAction(null);
    if (currentPlayerIdx + 1 < playerOrder.length) {
      setCurrentPlayerIdx(currentPlayerIdx + 1);
      setPhase('PASS');
    } else {
      setPhase('REVEAL');
    }
  };

  const resolveTurn = () => {
    const nextTerritories = JSON.parse(JSON.stringify(territories));
    let newLogs = [`--- Turn ${turn} Resolution ---`];
    let resolutions = []; 

    const supportBuffs = {};
    if (currentEvent.id !== 'FOG_OF_WAR') {
      Object.entries(orders).forEach(([sourceId, order]) => {
        if (order.type === 'SUPPORT') {
          let units = parseInt(territories[sourceId].units, 10);
          if (territories[sourceId].ownerId === 'p4') units += 1; 
          supportBuffs[order.targetId] = (supportBuffs[order.targetId] || 0) + units;
          newLogs.push(`${PLAYERS[territories[sourceId].ownerId].name} lends ${units} support to ${mapConfig.nodes[order.targetId].name}.`);
        }
      });
    }

    const battles = {}; 
    const transfers = []; 

    Object.entries(orders).forEach(([sourceId, order]) => {
      if (order.type === 'MARCH') {
        const sourceOwner = territories[sourceId].ownerId;
        const targetOwner = territories[order.targetId].ownerId;
        const baseUnits = parseInt(territories[sourceId].units, 10);
        
        if (sourceOwner === targetOwner) {
            transfers.push({ sourceId, targetId: order.targetId, ownerId: sourceOwner, unitsToMove: Math.max(0, baseUnits - 1) });
        } else {
            battles[order.targetId] = battles[order.targetId] || [];
            const support = parseInt(supportBuffs[sourceId] || 0, 10);
            let attPower = baseUnits + support;
            if (sourceOwner === 'p3') attPower += 1; 
            battles[order.targetId].push({ attackerId: sourceOwner, sourceId: sourceId, power: attPower });
        }
      }
    });

    Object.keys(battles).forEach(targetId => {
      const targetState = territories[targetId];
      const targetOwner = targetState.ownerId;
      const targetOrder = orders[targetId];
      const isCastle = mapConfig.nodes[targetId].isCastle;

      const baseDefUnits = parseInt(targetState.units, 10);
      const defSupport = parseInt(supportBuffs[targetId] || 0, 10);
      let defPower = baseDefUnits + defSupport;

      if (targetOrder?.type === 'DEFEND') {
          defPower += baseDefUnits;
          if (targetOwner === 'p2') defPower += 1; 
      }
      if (isCastle) defPower += 1; 
      if (currentEvent.id === 'REBELLION' && !targetOwner) defPower += 1; 

      const sortedAttackers = battles[targetId].sort((a, b) => b.power - a.power);
      const highestAttacker = sortedAttackers[0];
      const secondHighestPower = sortedAttackers.length > 1 ? sortedAttackers[1].power : 0;

      const castleText = isCastle ? " (Castle +1)" : "";
      const rebellionText = (currentEvent.id === 'REBELLION' && !targetOwner) ? " (Rebellion +1)" : "";

      if (highestAttacker.power > defPower && highestAttacker.power > secondHighestPower) {
        let newUnits = Math.max(1, parseInt(territories[highestAttacker.sourceId].units, 10) - 1);
        if (highestAttacker.attackerId === 'p1') newUnits = Math.min(9, newUnits + 1); 

        resolutions.push({ type: 'CONQUER', targetId, sourceId: highestAttacker.sourceId, newOwner: highestAttacker.attackerId, newUnits: newUnits });
        const attName = PLAYERS[highestAttacker.attackerId].name;
        const defName = targetOwner ? PLAYERS[targetOwner].name : 'Neutrals';
        newLogs.push(`⚔️ ${attName} crushed ${defName} at ${mapConfig.nodes[targetId].name}! (${highestAttacker.power} vs ${defPower}${castleText}${rebellionText})`);
      } else {
        resolutions.push({ type: 'DEFEND_SUCCESS', targetId, attackers: battles[targetId] });
        if (targetOwner) {
          newLogs.push(`🛡️ ${PLAYERS[targetOwner].name} held ${mapConfig.nodes[targetId].name} against attack! (${defPower}${castleText} vs ${highestAttacker.power})`);
        } else {
          newLogs.push(`🛡️ Neutrals held ${mapConfig.nodes[targetId].name}! (${defPower}${castleText}${rebellionText} vs ${highestAttacker.power})`);
        }
      }
    });

    const conqueredThisTurn = new Set();
    
    resolutions.forEach(res => {
      if (res.type === 'CONQUER') {
        nextTerritories[res.targetId] = { ...nextTerritories[res.targetId], ownerId: res.newOwner, units: parseInt(res.newUnits, 10) };
        nextTerritories[res.sourceId] = { ...nextTerritories[res.sourceId], units: 1 };
        conqueredThisTurn.add(res.targetId);
      } else if (res.type === 'DEFEND_SUCCESS') {
        res.attackers.forEach(att => {
          nextTerritories[att.sourceId] = { ...nextTerritories[att.sourceId], units: Math.max(1, parseInt(nextTerritories[att.sourceId].units, 10) - 1) };
        });
      }
    });

    transfers.forEach(transfer => {
      if (conqueredThisTurn.has(transfer.sourceId)) {
          newLogs.push(`❌ ${PLAYERS[transfer.ownerId].name}'s march from ${mapConfig.nodes[transfer.sourceId].name} failed as they were attacked.`);
          return;
      }
      transfer.departed = true;
      nextTerritories[transfer.sourceId] = { ...nextTerritories[transfer.sourceId], units: 1 };
    });

    transfers.forEach(transfer => {
        if (!transfer.departed) return;
        if (conqueredThisTurn.has(transfer.targetId)) {
            newLogs.push(`☠️ ${PLAYERS[transfer.ownerId].name}'s reinforcements from ${mapConfig.nodes[transfer.sourceId].name} were ambushed upon arriving at ${mapConfig.nodes[transfer.targetId].name}.`);
        } else {
            nextTerritories[transfer.targetId] = { ...nextTerritories[transfer.targetId], units: Math.min(9, parseInt(nextTerritories[transfer.targetId].units, 10) + transfer.unitsToMove) };
            if (transfer.unitsToMove > 0) newLogs.push(`🥾 ${PLAYERS[transfer.ownerId].name} safely marched ${transfer.unitsToMove} units to ${mapConfig.nodes[transfer.targetId].name}.`);
        }
    });

    if (currentEvent.id !== 'HARSH_WINTER') {
        const musterBonus = currentEvent.id === 'BOUNTIFUL_HARVEST' ? 2 : 1;
        Object.entries(orders).forEach(([sourceId, order]) => {
          if (order.type === 'MUSTER' && !conqueredThisTurn.has(sourceId)) {
            const usedToConquer = resolutions.some(r => r.type === 'CONQUER' && r.sourceId === sourceId);
            if (!usedToConquer) {
              nextTerritories[sourceId] = { ...nextTerritories[sourceId], units: Math.min(9, parseInt(nextTerritories[sourceId].units, 10) + musterBonus) };
              newLogs.push(`⛺ ${PLAYERS[territories[sourceId].ownerId].name} mustered forces in ${mapConfig.nodes[sourceId].name}.`);
            }
          }
        });
    }

    setTerritories(nextTerritories);
    setLogs(prev => [...newLogs, ...prev].slice(0, 30)); 
    setTurn(turn + 1);

    let counts = {};
    Object.keys(PLAYERS).forEach(k => counts[k] = 0);
    Object.values(nextTerritories).forEach(t => { if (t.ownerId) counts[t.ownerId]++; });

    const winningPlayer = Object.keys(counts).find(p => counts[p] >= mapConfig.winCondition);
    if (winningPlayer) {
      setWinner(PLAYERS[winningPlayer]);
      setPhase('GAME_OVER');
    } else {
      setCurrentEvent(GAME_EVENTS[EVENT_KEYS[Math.floor(Math.random() * EVENT_KEYS.length)]]);
      setPhase('WAR_ROOM');
      setActiveTab('map');
    }
  };

  // --- RENDERERS ---

  if (phase === 'TITLE') {
    return (
      <div className="fixed inset-0 bg-stone-950 flex flex-col items-center justify-center p-6 text-center text-stone-200 animate-fade-in z-50 overflow-auto">
        <Crown size={100} className="text-yellow-500 mb-6 drop-shadow-[0_0_20px_rgba(234,179,8,0.4)]" />
        <h1 className="text-5xl md:text-7xl font-black mb-4 uppercase tracking-tighter leading-tight">
          Crowns <br/><span className="text-red-600">&</span> Daggers
        </h1>
        <p className="text-lg md:text-xl text-stone-400 max-w-md mb-12">A game of hidden orders, ruthless diplomacy, and inevitable backstabbing.</p>
        
        <div className="w-full max-w-sm bg-stone-900 p-6 rounded-3xl border border-stone-800 shadow-2xl mb-8">
           <span className="text-stone-400 font-bold uppercase tracking-wider text-sm flex items-center justify-center gap-2 mb-4"><Users size={20}/> Player Count</span>
           <div className="flex justify-center gap-4">
           {[2, 3, 4].map(num => (
             <button 
               key={num} 
               onClick={() => setPlayerCount(num)}
               className={`w-16 h-16 rounded-2xl font-black text-2xl flex items-center justify-center transition-all ${playerCount === num ? 'bg-yellow-500 text-stone-900 shadow-[0_0_20px_rgba(234,179,8,0.5)] scale-110' : 'bg-stone-800 text-stone-500 hover:bg-stone-700'}`}
             >
               {num}
             </button>
           ))}
           </div>
        </div>

        <button 
          onClick={startGame}
          className="w-full max-w-sm bg-red-700 hover:bg-red-600 text-white font-black text-2xl py-5 rounded-2xl shadow-[0_0_30px_rgba(220,38,38,0.4)] transition-transform active:scale-95"
        >
          Begin Conquest
        </button>
      </div>
    );
  }

  if (phase === 'PASS') {
    const p = PLAYERS[playerOrder[currentPlayerIdx]];
    return (
      <div className={`fixed inset-0 ${p.color.replace('bg-', 'bg-').replace('500', '900')} flex flex-col items-center justify-center p-6 text-center z-50 animate-fade-in`}>
        <Shield size={100} className={p.text} />
        <h2 className="text-5xl font-black mt-8 mb-4 text-white">Pass Device to <br/><span className={p.text}>{p.name}</span></h2>
        <p className="text-stone-300 mb-16 text-xl">Ensure your screen is hidden.</p>
        <button 
          onClick={() => setPhase('SECRET')}
          className={`font-black text-2xl py-6 px-12 w-full max-w-sm rounded-2xl shadow-2xl active:scale-95 transition-transform ${p.color} text-stone-900`}
        >
          I am {p.name}
        </button>
      </div>
    );
  }

  if (phase === 'SECRET') {
    const p = PLAYERS[playerOrder[currentPlayerIdx]];
    return (
      <div className="fixed inset-0 bg-stone-950 flex flex-col z-50 animate-fade-in">
        {/* Minimal Header */}
        <div className="absolute top-0 left-0 right-0 p-4 pt-safe z-40 pointer-events-none flex justify-between items-start">
           <div className="pointer-events-auto bg-stone-900/90 backdrop-blur border-2 rounded-xl p-3 shadow-lg max-w-[60%]" style={{ borderColor: p.color.replace('bg-','') }}>
              <h2 className={`text-lg font-black leading-tight ${p.text}`}>{p.name}</h2>
              <p className="text-xs text-stone-400 line-clamp-1">{p.powerDesc}</p>
           </div>
           
           <button 
             onClick={nextPlayerOrder}
             className="pointer-events-auto bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-4 rounded-xl shadow-xl flex items-center gap-2 active:scale-95 transition-transform"
           >
             <Check size={20}/> Lock
           </button>
        </div>

        {/* Fullscreen Interactive Map */}
        <div className="flex-1 w-full h-full relative">
          <FullScreenMap 
            interactive={true} currentPlayerId={p.id} showAllOrders={false} 
            territories={territories} orders={orders} setOrders={setOrders} 
            selectedNode={selectedNode} setSelectedNode={setSelectedNode} 
            pendingAction={pendingAction} setPendingAction={setPendingAction} 
            mapData={mapConfig.nodes} currentEvent={currentEvent}
          />
        </div>
      </div>
    );
  }

  if (phase === 'REVEAL') {
    return (
      <div className="fixed inset-0 bg-stone-950 flex flex-col z-50 animate-fade-in">
        <div className="absolute top-safe left-0 right-0 p-4 z-40 pointer-events-none flex flex-col items-center">
            <div className="bg-red-900/90 backdrop-blur border-2 border-red-500 rounded-2xl p-4 shadow-2xl text-center pointer-events-auto w-full max-w-md">
              <h2 className="text-3xl font-black text-white uppercase tracking-widest mb-2">Orders Revealed</h2>
              <button 
                onClick={resolveTurn}
                className="w-full bg-red-600 hover:bg-red-500 text-white font-black py-4 rounded-xl shadow-lg flex justify-center items-center gap-2 text-xl active:scale-95 transition-transform"
              >
                Resolve Bloodshed <Swords/>
              </button>
            </div>
        </div>
        <div className="flex-1 w-full h-full relative">
          <FullScreenMap 
            showAllOrders={true} territories={territories} orders={orders} setOrders={setOrders} 
            mapData={mapConfig.nodes} currentEvent={currentEvent}
          />
        </div>
      </div>
    );
  }

  // GAME_OVER Phase (Full screen map overlay)
  if (phase === 'GAME_OVER') {
    return (
      <div className="fixed inset-0 bg-stone-950 flex flex-col z-50 animate-fade-in">
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-stone-950/80 backdrop-blur-sm p-6 text-center pointer-events-auto">
          <Crown size={120} className="text-yellow-500 mb-6 drop-shadow-[0_0_30px_rgba(234,179,8,0.6)]" />
          <h2 className="text-4xl md:text-6xl font-black mb-4 uppercase text-white tracking-widest">Victory</h2>
          <p className={`text-3xl md:text-5xl font-bold mb-12 ${winner.text}`}>{winner.name} Claims the Throne!</p>
          <button 
            onClick={() => setPhase('TITLE')}
            className="bg-stone-800 border-2 border-stone-600 text-white font-bold text-2xl py-5 w-full max-w-sm rounded-2xl shadow-xl active:scale-95 transition-transform"
          >
            Play Again
          </button>
        </div>
        <div className="absolute inset-0 z-0">
          <FullScreenMap 
             territories={territories} orders={{}} mapData={mapConfig.nodes} currentEvent={currentEvent}
          />
        </div>
      </div>
    );
  }

  // --- WAR ROOM (Main Hub) ---
  return (
    <div className="min-h-screen bg-stone-950 text-stone-200 font-sans flex flex-col overflow-hidden fixed inset-0">
      
      {/* Header */}
      <header className="bg-stone-900 border-b border-stone-800 p-4 pt-safe shadow-md flex justify-between items-center z-20 shrink-0">
        <div className="flex items-center gap-2">
          <Crown className="text-yellow-500" size={24} />
          <h1 className="text-xl font-black uppercase text-white">Turn {turn}</h1>
        </div>
        <button 
          onClick={startOrdersPhase}
          className="bg-blue-600 text-white font-bold py-2 px-4 rounded-full shadow-lg flex items-center gap-1 text-sm active:scale-95 transition-transform"
        >
          Draft Orders <ChevronRight size={16}/>
        </button>
      </header>

      {/* Main Content Area based on Tab */}
      <main className="flex-1 relative overflow-hidden flex flex-col">
        
        {/* MAP TAB */}
        <div className={`absolute inset-0 transition-opacity duration-300 ${activeTab === 'map' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
           <div className="absolute top-4 left-4 right-4 z-20">
              <div className="bg-stone-800/90 backdrop-blur p-3 rounded-2xl border border-stone-700 shadow-xl flex gap-3 items-center">
                <div className="text-3xl drop-shadow-md bg-stone-900 p-2 rounded-xl">{currentEvent.icon}</div>
                <div className="flex-1">
                  <h3 className="text-base font-bold text-white flex items-center gap-1 leading-tight">
                    <Sparkles size={14} className="text-blue-400" /> {currentEvent.name}
                  </h3>
                  <p className="text-stone-400 text-xs leading-tight mt-0.5">{currentEvent.desc}</p>
                </div>
              </div>
           </div>
           <FullScreenMap territories={territories} orders={orders} mapData={mapConfig.nodes} currentEvent={currentEvent} />
        </div>

        {/* INTEL TAB */}
        <div className={`absolute inset-0 overflow-y-auto bg-stone-950 p-6 transition-opacity duration-300 ${activeTab === 'intel' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
          <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-2"><ScrollText/> Houses & Standing</h2>
          <div className="flex flex-col gap-4">
            {Object.values(PLAYERS).slice(0, playerCount).map(p => {
              const owned = Object.values(territories).filter(t => t.ownerId === p.id).length;
              return (
                <div key={p.id} className="bg-stone-900 border border-stone-800 p-5 rounded-2xl shadow-lg">
                  <div className="flex justify-between items-center mb-3">
                    <span className={`text-xl font-black ${p.text}`}>{p.name}</span>
                    <div className="flex gap-1.5 bg-stone-950 p-1.5 rounded-lg border border-stone-800">
                      {[...Array(mapConfig.winCondition)].map((_, i) => (
                        <div key={i} className={`w-4 h-4 rounded-sm shadow-inner ${i < owned ? p.color : 'bg-stone-800'}`}></div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-stone-950/50 p-3 rounded-xl border border-stone-800/50">
                    <span className={`text-xs font-bold uppercase tracking-wider ${p.text} mb-1 block`}>{p.powerName}</span>
                    <p className="text-sm text-stone-300">{p.powerDesc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* LOGS TAB */}
        <div className={`absolute inset-0 overflow-y-auto bg-stone-950 p-6 transition-opacity duration-300 ${activeTab === 'logs' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
           <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-2"><History/> Ravens & Reports</h2>
           <div className="flex flex-col gap-3 pb-8">
              {logs.map((log, i) => (
                <div key={i} className={`p-4 rounded-xl shadow-md ${log.includes('---') ? 'bg-stone-800/80 text-white font-black text-center my-4 uppercase tracking-widest' : 'bg-stone-900 border border-stone-800 text-stone-300'}`}>
                  {log}
                </div>
              ))}
            </div>
        </div>

      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="bg-stone-900 border-t border-stone-800 pb-safe shrink-0 z-20 flex justify-around p-2">
        <button onClick={() => setActiveTab('map')} className={`flex flex-col items-center p-2 w-20 transition-colors ${activeTab === 'map' ? 'text-white' : 'text-stone-500 hover:text-stone-300'}`}>
          <MapIcon size={24} className="mb-1" />
          <span className="text-xs font-bold">Map</span>
        </button>
        <button onClick={() => setActiveTab('intel')} className={`flex flex-col items-center p-2 w-20 transition-colors ${activeTab === 'intel' ? 'text-white' : 'text-stone-500 hover:text-stone-300'}`}>
          <ScrollText size={24} className="mb-1" />
          <span className="text-xs font-bold">Intel</span>
        </button>
        <button onClick={() => setActiveTab('logs')} className={`flex flex-col items-center p-2 w-20 transition-colors ${activeTab === 'logs' ? 'text-white' : 'text-stone-500 hover:text-stone-300'}`}>
          <History size={24} className="mb-1" />
          <span className="text-xs font-bold">Logs</span>
        </button>
      </nav>

      {/* Global CSS Inject */}
      <style dangerouslySetInnerHTML={{__html: `
        :root { --sat: env(safe-area-inset-top); --sab: env(safe-area-inset-bottom); }
        .pt-safe { padding-top: max(1rem, var(--sat)); }
        .pb-safe { padding-bottom: max(1rem, var(--sab)); }
        
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
        
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        .animate-slide-up { animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        
        body, html { overscroll-behavior-y: none; background-color: #0c0a09; }
      `}} />
    </div>
  );
}