import React, { useState, useEffect } from 'react';
import { Swords, Shield, Handshake, Tent, Crown, ChevronRight, AlertCircle, Castle, Sparkles, Users } from 'lucide-react';

// --- GAME CONFIGURATION & CONSTANTS ---
const PLAYERS = {
  p1: { id: 'p1', name: 'House Stag', color: 'bg-yellow-500', border: 'border-yellow-600', text: 'text-yellow-500', powerName: 'Ours is the Fury', powerDesc: '+1 Unit upon successfully conquering.' },
  p2: { id: 'p2', name: 'House Wolf', color: 'bg-stone-300', border: 'border-stone-500', text: 'text-stone-300', powerName: 'Winter is Coming', powerDesc: '+1 Strength to Defend orders.' },
  p3: { id: 'p3', name: 'House Dragon', color: 'bg-red-600', border: 'border-red-800', text: 'text-red-500', powerName: 'Fire and Blood', powerDesc: 'Innate +1 Strength to all Attacks.' },
  p4: { id: 'p4', name: 'House Kraken', color: 'bg-teal-600', border: 'border-teal-800', text: 'text-teal-500', powerName: 'Iron Fleet', powerDesc: '+1 Strength to Support orders.' },
};

const NEUTRAL_COLOR = 'bg-stone-700';
const NEUTRAL_BORDER = 'border-stone-800';

// Global Event Definitions
const GAME_EVENTS = {
  CLEAR_SKIES: { id: 'CLEAR_SKIES', name: 'Clear Skies', desc: 'No special rules this turn. Standard warfare applies.', icon: '🌤️' },
  HARSH_WINTER: { id: 'HARSH_WINTER', name: 'Harsh Winter', desc: 'The cold bites. Muster orders cannot be played this turn.', icon: '❄️' },
  FOG_OF_WAR: { id: 'FOG_OF_WAR', name: 'Fog of War', desc: 'Communication is lost. Support orders cannot be played this turn.', icon: '🌫️' },
  BOUNTIFUL_HARVEST: { id: 'BOUNTIFUL_HARVEST', name: 'Bountiful Harvest', desc: 'Plentiful food. Muster orders grant +2 units instead of +1.', icon: '🌾' },
  REBELLION: { id: 'REBELLION', name: 'Rebellion', desc: 'The smallfolk rise. All Neutral territories gain +1 Defense this turn.', icon: '🔥' }
};
const EVENT_KEYS = Object.keys(GAME_EVENTS);

// Map Configurations for different player counts
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
      t1: { ownerId: 'p2', units: 4 }, // Wolf Starts North
      t2: { ownerId: null, units: 1 },
      t3: { ownerId: null, units: 1 },
      t4: { ownerId: null, units: 1 },
      t5: { ownerId: null, units: 3 }, // Throne Guarded
      t6: { ownerId: null, units: 1 },
      t7: { ownerId: null, units: 1 },
      t8: { ownerId: 'p1', units: 4 }, // Stag Starts South
    }
  },
  3: {
    winCondition: 6,
    nodes: {
      t1: { id: 't1', name: 'The Frozen Wastes', x: 15, y: 10, connections: ['t3', 't8', 't12'] },
      t2: { id: 't2', name: 'The High Peaks', x: 85, y: 10, connections: ['t5', 't9', 't12'] },
      t3: { id: 't3', name: 'The Riverlands', x: 25, y: 35, connections: ['t1', 't8', 't12', 't4', 't10'] },
      t4: { id: 't4', name: 'The Throne', x: 50, y: 55, connections: ['t3', 't12', 't5', 't10', 't11'], isCastle: true }, 
      t5: { id: 't5', name: 'The Deep Forest', x: 75, y: 35, connections: ['t2', 't9', 't12', 't4', 't11'] },
      t6: { id: 't6', name: 'The Golden Coast', x: 15, y: 85, connections: ['t8', 't10'] },
      t7: { id: 't7', name: 'The Sunken Desert', x: 85, y: 85, connections: ['t9', 't11'] },
      t8: { id: 't8', name: 'The Iron Isles', x: 5, y: 55, connections: ['t1', 't3', 't6'], isCastle: true },
      t9: { id: 't9', name: 'The Vale', x: 95, y: 55, connections: ['t2', 't5', 't7'], isCastle: true },
      t10: { id: 't10', name: 'The Reach', x: 30, y: 75, connections: ['t6', 't3', 't4', 't11'], isCastle: true },
      t11: { id: 't11', name: 'The Stormlands', x: 70, y: 75, connections: ['t7', 't5', 't4', 't10'] },
      t12: { id: 't12', name: 'The Crownlands', x: 50, y: 25, connections: ['t1', 't2', 't3', 't5', 't4'] },
    },
    initial: {
      t1: { ownerId: 'p2', units: 3 }, // Wolf North West
      t2: { ownerId: null, units: 1 }, 
      t3: { ownerId: null, units: 1 },
      t4: { ownerId: null, units: 3 }, // Throne
      t5: { ownerId: null, units: 1 }, 
      t6: { ownerId: 'p3', units: 3 }, // Dragon South West
      t7: { ownerId: 'p1', units: 3 }, // Stag South East
      t8: { ownerId: null, units: 1 },
      t9: { ownerId: null, units: 1 },
      t10: { ownerId: null, units: 1 },
      t11: { ownerId: null, units: 1 },
      t12: { ownerId: null, units: 2 }, 
    }
  },
  4: {
    winCondition: 6,
    nodes: {
      t1: { id: 't1', name: 'The Frozen Wastes', x: 15, y: 15, connections: ['t3', 't8', 't15'], isCastle: true },
      t2: { id: 't2', name: 'The High Peaks', x: 85, y: 15, connections: ['t5', 't9', 't15'], isCastle: true },
      t3: { id: 't3', name: 'The Riverlands', x: 30, y: 35, connections: ['t1', 't8', 't12', 't4', 't10'] },
      t4: { id: 't4', name: 'The Throne', x: 50, y: 50, connections: ['t3', 't12', 't5', 't10', 't11'], isCastle: true },
      t5: { id: 't5', name: 'The Deep Forest', x: 70, y: 35, connections: ['t2', 't9', 't12', 't4', 't11'] },
      t6: { id: 't6', name: 'The Golden Coast', x: 15, y: 80, connections: ['t8', 't10', 't13'], isCastle: true },
      t7: { id: 't7', name: 'The Sunken Desert', x: 85, y: 80, connections: ['t9', 't11', 't14'], isCastle: true },
      t8: { id: 't8', name: 'The Iron Isles', x: 10, y: 50, connections: ['t1', 't3', 't6', 't13'] },
      t9: { id: 't9', name: 'The Vale', x: 90, y: 50, connections: ['t2', 't5', 't7', 't16'] },
      t10: { id: 't10', name: 'The Reach', x: 35, y: 65, connections: ['t6', 't3', 't4', 't11', 't14'] },
      t11: { id: 't11', name: 'The Stormlands', x: 65, y: 65, connections: ['t7', 't5', 't4', 't10', 't14'] },
      t12: { id: 't12', name: 'The Crownlands', x: 50, y: 30, connections: ['t15', 't3', 't5', 't4'] },
      t13: { id: 't13', name: 'The Western Isles', x: 5, y: 65, connections: ['t8', 't6'] }, 
      t14: { id: 't14', name: 'Dorne', x: 50, y: 85, connections: ['t10', 't11', 't7', 't6'] }, 
      t15: { id: 't15', name: 'Shivering Sea', x: 50, y: 15, connections: ['t1', 't2', 't12'] },
      t16: { id: 't16', name: 'Narrow Sea', x: 95, y: 65, connections: ['t9', 't7'] },
    },
    initial: {
      t1: { ownerId: 'p2', units: 3 }, // Wolf NW
      t2: { ownerId: 'p3', units: 3 }, // Dragon NE
      t3: { ownerId: null, units: 1 },
      t4: { ownerId: null, units: 3 }, // Throne
      t5: { ownerId: null, units: 1 }, 
      t6: { ownerId: 'p4', units: 3 }, // Kraken SW
      t7: { ownerId: 'p1', units: 3 }, // Stag SE
      t8: { ownerId: null, units: 1 },
      t9: { ownerId: null, units: 1 },
      t10: { ownerId: null, units: 1 },
      t11: { ownerId: null, units: 1 },
      t12: { ownerId: null, units: 2 },
      t13: { ownerId: null, units: 1 },
      t14: { ownerId: null, units: 2 }, // Dorne
      t15: { ownerId: null, units: 1 },
      t16: { ownerId: null, units: 1 },
    }
  }
};


// --- SUB-COMPONENTS ---

// Renders the interactive Map
const MapBoard = ({ 
  interactive = false, 
  currentPlayerId = null, 
  showAllOrders = false,
  territories,
  orders,
  setOrders,
  selectedNode,
  setSelectedNode,
  pendingAction,
  setPendingAction,
  mapData,
  currentEvent
}) => {
  const mapRef = React.useRef(null);
  const dragDistance = React.useRef(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [scrollStart, setScrollStart] = useState({ x: 0, y: 0 });

  const canMuster = currentEvent.id !== 'HARSH_WINTER';
  const canSupport = currentEvent.id !== 'FOG_OF_WAR';
  const getNeighbors = (id) => mapData[id].connections;

  // Center map on initial load
  useEffect(() => {
    const centerMap = () => {
      if (mapRef.current) {
        const { scrollWidth, clientWidth, scrollHeight, clientHeight } = mapRef.current;
        mapRef.current.scrollLeft = (scrollWidth - clientWidth) / 2;
        mapRef.current.scrollTop = (scrollHeight - clientHeight) / 2;
      }
    };

    centerMap();
    const timer1 = setTimeout(centerMap, 50);
    const timer2 = setTimeout(centerMap, 250);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    dragDistance.current = 0;
    setDragStart({ x: e.pageX, y: e.pageY });
    setScrollStart({
      x: mapRef.current.scrollLeft,
      y: mapRef.current.scrollTop,
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const dx = e.pageX - dragStart.x;
    const dy = e.pageY - dragStart.y;
    dragDistance.current += Math.abs(dx) + Math.abs(dy);
    mapRef.current.scrollLeft = scrollStart.x - dx;
    mapRef.current.scrollTop = scrollStart.y - dy;
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  // Handle clicking a node during secret orders
  const handleNodeClick = (nodeId) => {
    if (!interactive) return;
    if (dragDistance.current > 20) return; // Prevent click if we were just panning

    const nodeState = territories[nodeId];
    
    // If we are waiting to target something for Attack/Support
    if (pendingAction && selectedNode) {
      if (getNeighbors(selectedNode).includes(nodeId)) {
        setOrders(prev => ({
          ...prev,
          [selectedNode]: { type: pendingAction, targetId: nodeId }
        }));
      }
      setPendingAction(null);
      setSelectedNode(null);
      return;
    }

    // Otherwise, select a territory we own
    if (nodeState.ownerId === currentPlayerId) {
      setSelectedNode(selectedNode === nodeId ? null : nodeId);
      setPendingAction(null);
    }
  };

  return (
    <div 
      ref={mapRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUpOrLeave}
      onMouseLeave={handleMouseUpOrLeave}
      className={`w-full h-[60vh] md:h-auto md:aspect-video bg-stone-900 rounded-xl border border-stone-700 overflow-auto shadow-2xl hide-scroll ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}
    >
      {/* Generous padding wrapper to create empty safe-zones for panning */}
      <div className="p-24 md:p-40 w-full h-full min-w-[1000px] min-h-[800px] box-border">
        <div className="relative w-full h-full">
          {/* SVG Connections Layer */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {Object.values(mapData).map(node => (
              node.connections.map(targetId => {
                const target = mapData[targetId];
                // Only draw line once (if id < targetId) to prevent double drawing
                if (node.id < targetId) {
                  return (
                    <line
                      key={`${node.id}-${targetId}`}
                      x1={`${node.x}%`} y1={`${node.y}%`}
                      x2={`${target.x}%`} y2={`${target.y}%`}
                      stroke="#444" strokeWidth="3" strokeDasharray="6 4"
                      className="opacity-50"
                    />
                  );
                }
                return null;
              })
            ))}
          
          {/* Draw Order Action Lines (Arrows) */}
          {Object.entries(orders).map(([sourceId, order]) => {
            // Only show lines if revealing, or if it's the current player's secret turn
            if (!showAllOrders && (!currentPlayerId || territories[sourceId].ownerId !== currentPlayerId)) return null;

            if (order.type === 'MARCH' || order.type === 'SUPPORT') {
              const source = mapData[sourceId];
              const target = mapData[order.targetId];
              const isSupport = order.type === 'SUPPORT';
              const isFriendly = order.type === 'MARCH' && territories[order.targetId].ownerId === territories[sourceId].ownerId;
              
              let strokeColor = "#ef4444"; // default red for attack
              if (isSupport) strokeColor = "#3b82f6"; // blue for support
              else if (isFriendly) strokeColor = "#d6d3d1"; // light stone/gray for transfer

              return (
                <line
                  key={`order-${sourceId}`}
                  x1={`${source.x}%`} y1={`${source.y}%`}
                  x2={`${target.x}%`} y2={`${target.y}%`}
                  stroke={strokeColor} 
                  strokeWidth="4"
                  markerEnd="url(#arrowhead)"
                  className="animate-pulse"
                />
              );
            }
            return null;
          })}
          
          {/* SVG Definitions for Arrows */}
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#fff" opacity="0.5"/>
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
          
          // Determine if we should show an order token here
          const nodeOrder = orders[node.id];
          const showOrder = Boolean(nodeOrder && (showAllOrders || (currentPlayerId && tState.ownerId === currentPlayerId)));

          return (
            <div
              key={node.id}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200
                ${isTargetable ? 'scale-110 z-20 cursor-crosshair' : ''}
                ${isSelected ? 'scale-125 z-30' : 'z-10 hover:scale-110'}
                ${interactive && tState.ownerId === currentPlayerId ? 'cursor-pointer' : ''}
              `}
              style={{ left: `${node.x}%`, top: `${node.y}%` }}
              onClick={() => handleNodeClick(node.id)}
            >
              {/* Territory Name Label */}
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap text-xs font-bold text-stone-400 bg-stone-900/80 px-2 py-1 rounded">
                {node.name}
              </div>

              {/* Castle Indicator */}
              {isCastle && (
                 <div className="absolute -top-2 -left-2 bg-stone-800 rounded-full p-1 border border-stone-500 shadow-md z-20" title="Castle: +1 Defense">
                    <Castle size={14} className="text-stone-300" />
                 </div>
              )}

              {/* The Node Circle */}
              <div className={`w-14 h-14 md:w-16 md:h-16 rounded-full border-4 flex items-center justify-center relative shadow-lg
                ${owner ? owner.color : NEUTRAL_COLOR}
                ${owner ? owner.border : NEUTRAL_BORDER}
                ${isTargetable ? 'ring-4 ring-white animate-pulse' : ''}
                ${isSelected ? 'ring-4 ring-yellow-400' : ''}
              `}>
                <span className="text-xl font-black text-white drop-shadow-md">{tState.units}</span>
                
                {/* Visual Order Token Indicator */}
                {showOrder && (
                  <div className="absolute -bottom-3 -right-3 w-8 h-8 bg-stone-800 rounded-full border-2 border-stone-400 flex items-center justify-center shadow-md text-white">
                    {nodeOrder.type === 'MARCH' && <Swords size={16} className="text-red-400"/>}
                    {nodeOrder.type === 'DEFEND' && <Shield size={16} className="text-green-400"/>}
                    {nodeOrder.type === 'SUPPORT' && <Handshake size={16} className="text-blue-400"/>}
                    {nodeOrder.type === 'MUSTER' && <Tent size={16} className="text-yellow-400"/>}
                  </div>
                )}
              </div>

              {/* Radial Action Menu (Only shows when selected) */}
              {isSelected && interactive && !pendingAction && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 pointer-events-none">
                  <button onClick={(e) => { e.stopPropagation(); setPendingAction('MARCH'); }} className="pointer-events-auto absolute -top-4 left-1/2 transform -translate-x-1/2 w-10 h-10 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-500 border-2 border-stone-900 shadow-xl transition-transform hover:scale-110" title="March / Attack">
                    <Swords size={18} className="text-white"/>
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); setOrders(prev => ({...prev, [node.id]: { type: 'DEFEND' }})); setSelectedNode(null); }} className="pointer-events-auto absolute bottom-0 left-1/2 transform -translate-x-1/2 w-10 h-10 bg-green-600 rounded-full flex items-center justify-center hover:bg-green-500 border-2 border-stone-900 shadow-xl transition-transform hover:scale-110" title="Defend">
                    <Shield size={18} className="text-white"/>
                  </button>
                  {canSupport && (
                    <button onClick={(e) => { e.stopPropagation(); setPendingAction('SUPPORT'); }} className="pointer-events-auto absolute top-1/2 -right-4 transform -translate-y-1/2 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-500 border-2 border-stone-900 shadow-xl transition-transform hover:scale-110" title="Support">
                      <Handshake size={18} className="text-white"/>
                    </button>
                  )}
                  {canMuster && (
                    <button onClick={(e) => { e.stopPropagation(); setOrders(prev => ({...prev, [node.id]: { type: 'MUSTER' }})); setSelectedNode(null); }} className="pointer-events-auto absolute top-1/2 -left-4 transform -translate-y-1/2 w-10 h-10 bg-yellow-600 rounded-full flex items-center justify-center hover:bg-yellow-500 border-2 border-stone-900 shadow-xl transition-transform hover:scale-110" title="Muster">
                      <Tent size={18} className="text-white"/>
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
        </div>
      </div>
    </div>
  );
};

// --- MAIN APPLICATION COMPONENT ---
export default function App() {
  // Game Setup State
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

  // --- GAME LOOP LOGIC ---

  const startGame = () => {
    const config = MAP_CONFIGS[playerCount];
    setMapConfig(config);
    setTerritories(config.initial);
    setTurn(1);
    setOrders({});
    setLogs(["The war for the Throne begins!"]);
    setWinner(null);
    setPhase('WAR_ROOM');
    
    // Pick first event
    const randomEvent = GAME_EVENTS[EVENT_KEYS[Math.floor(Math.random() * EVENT_KEYS.length)]];
    setCurrentEvent(randomEvent);

    // Randomize turn order based on active players
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

    // 1. Calculate Support Buffs
    const supportBuffs = {};
    if (currentEvent.id !== 'FOG_OF_WAR') {
      Object.entries(orders).forEach(([sourceId, order]) => {
        if (order.type === 'SUPPORT') {
          let units = parseInt(territories[sourceId].units, 10);
          if (territories[sourceId].ownerId === 'p4') units += 1; // Kraken Power: +1 Support
          
          supportBuffs[order.targetId] = (supportBuffs[order.targetId] || 0) + units;
          newLogs.push(`${PLAYERS[territories[sourceId].ownerId].name} lends ${units} support to ${mapConfig.nodes[order.targetId].name}.`);
        }
      });
    }

    // 2. Evaluate Combats & Transfers
    const battles = {}; 
    const transfers = []; 

    Object.entries(orders).forEach(([sourceId, order]) => {
      if (order.type === 'MARCH') {
        const sourceOwner = territories[sourceId].ownerId;
        const targetOwner = territories[order.targetId].ownerId;
        
        const baseUnits = parseInt(territories[sourceId].units, 10);
        
        if (sourceOwner === targetOwner) {
            transfers.push({
                sourceId,
                targetId: order.targetId,
                ownerId: sourceOwner,
                unitsToMove: Math.max(0, baseUnits - 1)
            });
        } else {
            battles[order.targetId] = battles[order.targetId] || [];
            const support = parseInt(supportBuffs[sourceId] || 0, 10);
            let attPower = baseUnits + support;
            if (sourceOwner === 'p3') attPower += 1; // Dragon Power: +1 Attack
            
            battles[order.targetId].push({
              attackerId: sourceOwner,
              sourceId: sourceId,
              power: attPower
            });
        }
      }
    });

    // Resolve each battled territory
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
          if (targetOwner === 'p2') defPower += 1; // Wolf Power: +1 Defend
      }
      if (isCastle) defPower += 1; // Castle Defense Bonus
      if (currentEvent.id === 'REBELLION' && !targetOwner) defPower += 1; // Neutral Rebellion Bonus

      const sortedAttackers = battles[targetId].sort((a, b) => b.power - a.power);
      const highestAttacker = sortedAttackers[0];
      const secondHighestPower = sortedAttackers.length > 1 ? sortedAttackers[1].power : 0;

      const castleText = isCastle ? " (Castle +1)" : "";
      const rebellionText = (currentEvent.id === 'REBELLION' && !targetOwner) ? " (Rebellion +1)" : "";

      // Determine Winner
      if (highestAttacker.power > defPower && highestAttacker.power > secondHighestPower) {
        // Attacker Wins
        let newUnits = Math.max(1, parseInt(territories[highestAttacker.sourceId].units, 10) - 1);
        if (highestAttacker.attackerId === 'p1') newUnits = Math.min(9, newUnits + 1); // Stag Power: +1 on Conquer

        resolutions.push({
          type: 'CONQUER',
          targetId,
          sourceId: highestAttacker.sourceId,
          newOwner: highestAttacker.attackerId,
          newUnits: newUnits
        });
        
        const attName = PLAYERS[highestAttacker.attackerId].name;
        const defName = targetOwner ? PLAYERS[targetOwner].name : 'Neutrals';
        newLogs.push(`⚔️ ${attName} crushed ${defName} at ${mapConfig.nodes[targetId].name}! (${highestAttacker.power} vs ${defPower}${castleText}${rebellionText})`);
      } else {
        // Defender Holds
        resolutions.push({ type: 'DEFEND_SUCCESS', targetId, attackers: battles[targetId] });
        if (targetOwner) {
          newLogs.push(`🛡️ ${PLAYERS[targetOwner].name} held ${mapConfig.nodes[targetId].name} against attack! (${defPower}${castleText} vs ${highestAttacker.power})`);
        } else {
          newLogs.push(`🛡️ Neutrals held ${mapConfig.nodes[targetId].name}! (${defPower}${castleText}${rebellionText} vs ${highestAttacker.power})`);
        }
      }
    });

    // 3. Apply Mutations 
    const conqueredThisTurn = new Set();
    
    // Apply successful attacks
    resolutions.forEach(res => {
      if (res.type === 'CONQUER') {
        nextTerritories[res.targetId] = {
            ...nextTerritories[res.targetId],
            ownerId: res.newOwner,
            units: parseInt(res.newUnits, 10)
        };
        nextTerritories[res.sourceId] = {
            ...nextTerritories[res.sourceId],
            units: 1 
        };
        conqueredThisTurn.add(res.targetId);
      } else if (res.type === 'DEFEND_SUCCESS') {
        res.attackers.forEach(att => {
          nextTerritories[att.sourceId] = {
              ...nextTerritories[att.sourceId],
              units: Math.max(1, parseInt(nextTerritories[att.sourceId].units, 10) - 1)
          };
        });
      }
    });

    // --- APPLY TRANSFERS ---
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
            nextTerritories[transfer.targetId] = {
                ...nextTerritories[transfer.targetId],
                units: Math.min(9, parseInt(nextTerritories[transfer.targetId].units, 10) + transfer.unitsToMove)
            };
            if (transfer.unitsToMove > 0) {
                newLogs.push(`🥾 ${PLAYERS[transfer.ownerId].name} safely marched ${transfer.unitsToMove} units to ${mapConfig.nodes[transfer.targetId].name}.`);
            }
        }
    });

    // Apply Musters 
    if (currentEvent.id !== 'HARSH_WINTER') {
        const musterBonus = currentEvent.id === 'BOUNTIFUL_HARVEST' ? 2 : 1;
        Object.entries(orders).forEach(([sourceId, order]) => {
          if (order.type === 'MUSTER' && !conqueredThisTurn.has(sourceId)) {
            const usedToConquer = resolutions.some(r => r.type === 'CONQUER' && r.sourceId === sourceId);
            if (!usedToConquer) {
              nextTerritories[sourceId] = {
                  ...nextTerritories[sourceId],
                  units: Math.min(9, parseInt(nextTerritories[sourceId].units, 10) + musterBonus)
              };
              newLogs.push(`⛺ ${PLAYERS[territories[sourceId].ownerId].name} mustered forces in ${mapConfig.nodes[sourceId].name}.`);
            }
          }
        });
    }

    // 4. Update State & Check Win Conditions
    setTerritories(nextTerritories);
    setLogs(prev => [...newLogs, ...prev].slice(0, 20)); 
    setTurn(turn + 1);

    // Check Win
    let counts = {};
    Object.keys(PLAYERS).forEach(k => counts[k] = 0);
    Object.values(nextTerritories).forEach(t => {
      if (t.ownerId) counts[t.ownerId]++;
    });

    const winningPlayer = Object.keys(counts).find(p => counts[p] >= mapConfig.winCondition);
    if (winningPlayer) {
      setWinner(PLAYERS[winningPlayer]);
      setPhase('GAME_OVER');
    } else {
      // Pick next event and return to War Room
      setCurrentEvent(GAME_EVENTS[EVENT_KEYS[Math.floor(Math.random() * EVENT_KEYS.length)]]);
      setPhase('WAR_ROOM');
    }
  };

  // --- MAIN RENDER ---
  return (
    <div className="min-h-screen bg-stone-950 text-stone-200 font-sans selection:bg-red-900 overflow-x-hidden">
      
      {/* HEADER */}
      <header className="bg-stone-900 border-b border-stone-800 p-4 shadow-md flex justify-between items-center z-50 relative">
        <div className="flex items-center gap-2">
          <Crown className="text-yellow-500" size={28} />
          <h1 className="text-2xl font-black tracking-widest uppercase text-white">Crowns <span className="text-red-600">&</span> Daggers</h1>
        </div>
        {phase !== 'TITLE' && phase !== 'GAME_OVER' && (
          <div className="text-sm font-bold text-stone-400 bg-stone-800 px-4 py-1 rounded-full border border-stone-700">
            Turn {turn}
          </div>
        )}
      </header>

      <main className="max-w-6xl mx-auto p-4 md:p-8 flex flex-col gap-6">

        {/* --- TITLE SCREEN --- */}
        {phase === 'TITLE' && (
          <div className="flex flex-col items-center justify-center mt-20 text-center animate-fade-in">
            <Crown size={80} className="text-yellow-500 mb-6" />
            <h2 className="text-5xl md:text-7xl font-black mb-4 uppercase tracking-tighter">Betray Your <br/><span className="text-red-600">Friends</span></h2>
            <p className="text-xl text-stone-400 max-w-xl mb-12">A game of hidden orders, ruthless diplomacy, and inevitable backstabbing.</p>
            
            <div className="flex items-center justify-center gap-4 mb-8 bg-stone-900 p-4 rounded-2xl border border-stone-800">
               <span className="text-stone-400 font-bold uppercase tracking-wider text-sm flex items-center gap-2"><Users size={18}/> Players:</span>
               {[2, 3, 4].map(num => (
                 <button 
                   key={num} 
                   onClick={() => setPlayerCount(num)}
                   className={`w-12 h-12 rounded-full font-black text-xl flex items-center justify-center transition-all ${playerCount === num ? 'bg-yellow-500 text-stone-900 shadow-[0_0_15px_rgba(234,179,8,0.5)] scale-110' : 'bg-stone-800 text-stone-500 hover:bg-stone-700'}`}
                 >
                   {num}
                 </button>
               ))}
            </div>

            <button 
              onClick={startGame}
              className="bg-red-700 hover:bg-red-600 text-white font-bold text-2xl py-4 px-12 rounded-lg shadow-[0_0_20px_rgba(220,38,38,0.5)] transition-all transform hover:scale-105"
            >
              Start Game
            </button>
          </div>
        )}

        {/* --- WAR ROOM (PUBLIC) --- */}
        {phase === 'WAR_ROOM' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
            <div className="lg:col-span-2 flex flex-col gap-4">
              
              {/* Event Banner */}
              <div className="bg-stone-800 p-4 rounded-xl border border-blue-900/50 shadow-lg flex gap-4 items-center">
                <div className="text-4xl drop-shadow-md">{currentEvent.icon}</div>
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Sparkles size={16} className="text-blue-400" /> Event: {currentEvent.name}
                  </h3>
                  <p className="text-stone-300 text-sm">{currentEvent.desc}</p>
                </div>
              </div>

              <div className="bg-stone-800 p-4 rounded-xl border border-stone-700 flex justify-between items-center shadow-lg">
                <div>
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <AlertCircle className="text-blue-400" />
                  Public Diplomacy Phase
                </h2>
                <p className="text-stone-400 text-sm mt-1">Discuss, form alliances, and lie. When ready, input orders secretly.</p>
              </div>
              <button 
                onClick={startOrdersPhase}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-lg shadow-lg flex items-center gap-2 transition-transform hover:scale-105"
              >
                Begin Secret Orders <ChevronRight size={20}/>
              </button>
            </div>
            <MapBoard 
              showAllOrders={false} 
              territories={territories}
              orders={orders}
              setOrders={setOrders}
              selectedNode={selectedNode}
              setSelectedNode={setSelectedNode}
              pendingAction={pendingAction}
              setPendingAction={setPendingAction}
              mapData={mapConfig.nodes}
              currentEvent={currentEvent}
            />
          </div>

          <div className="flex flex-col gap-4">
              {/* Leaderboard */}
              <div className="bg-stone-900 border border-stone-700 rounded-xl p-4 shadow-lg">
                <h3 className="text-xl font-bold text-white border-b border-stone-800 pb-2 mb-4">The Houses</h3>
                <div className="flex flex-col gap-3">
                  {Object.values(PLAYERS).slice(0, playerCount).map(p => {
                    const owned = Object.values(territories).filter(t => t.ownerId === p.id).length;
                    return (
                      <div key={p.id} className="flex flex-col bg-stone-800 p-3 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className={`font-bold ${p.text}`}>{p.name}</span>
                          <div className="flex gap-1">
                            {[...Array(mapConfig.winCondition)].map((_, i) => (
                              <div key={i} className={`w-3 h-3 md:w-4 md:h-4 rounded-sm ${i < owned ? p.color : 'bg-stone-700'}`}></div>
                            ))}
                          </div>
                        </div>
                        <div className="text-xs text-stone-400 mt-1">
                          <span className="font-bold text-stone-300">{p.powerName}:</span> {p.powerDesc}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Action Log */}
              <div className="bg-stone-900 border border-stone-700 rounded-xl p-4 shadow-lg flex-1 overflow-hidden flex flex-col">
                <h3 className="text-xl font-bold text-white border-b border-stone-800 pb-2 mb-4">Ravens (Logs)</h3>
                <div className="overflow-y-auto flex-1 flex flex-col gap-2 text-sm pr-2 scrollbar-thin scrollbar-thumb-stone-700">
                  {logs.map((log, i) => (
                    <div key={i} className={`p-2 rounded ${log.includes('---') ? 'bg-stone-800 text-stone-300 font-bold text-center my-2' : 'bg-stone-800/50 text-stone-400 border-l-2 border-stone-600'}`}>
                      {log}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- PASS DEVICE SCREEN --- */}
        {phase === 'PASS' && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-fade-in">
            <Shield size={64} className={PLAYERS[playerOrder[currentPlayerIdx]].text} />
            <h2 className="text-4xl font-black mt-6 mb-2">Pass Device to <br/><span className={PLAYERS[playerOrder[currentPlayerIdx]].text}>{PLAYERS[playerOrder[currentPlayerIdx]].name}</span></h2>
            <p className="text-stone-400 mb-12 text-lg">Ensure no one else is looking.</p>
            <button 
              onClick={() => setPhase('SECRET')}
              className={`font-bold text-2xl py-4 px-12 rounded-lg shadow-lg text-stone-900 transition-transform hover:scale-105 ${PLAYERS[playerOrder[currentPlayerIdx]].color}`}
            >
              I am {PLAYERS[playerOrder[currentPlayerIdx]].name}
            </button>
          </div>
        )}

        {/* --- SECRET ORDERS SCREEN --- */}
        {phase === 'SECRET' && (
          <div className="flex flex-col gap-4 animate-fade-in relative">
            <div className={`p-4 rounded-xl flex justify-between items-center shadow-lg border-2 ${PLAYERS[playerOrder[currentPlayerIdx]].border} bg-stone-900`}>
              <div>
                <h2 className={`text-xl font-bold ${PLAYERS[playerOrder[currentPlayerIdx]].text}`}>Secret Orders: {PLAYERS[playerOrder[currentPlayerIdx]].name}</h2>
                <p className="text-stone-400 text-sm mb-2">Click your territories to issue commands.</p>
                <div className="inline-flex items-center gap-1 bg-stone-950 px-2 py-1 rounded border border-stone-700 text-xs">
                  <Sparkles size={12} className={PLAYERS[playerOrder[currentPlayerIdx]].text} />
                  <span className={`font-bold ${PLAYERS[playerOrder[currentPlayerIdx]].text}`}>{PLAYERS[playerOrder[currentPlayerIdx]].powerName}:</span>
                  <span className="text-stone-300">{PLAYERS[playerOrder[currentPlayerIdx]].powerDesc}</span>
                </div>
              </div>
              <button 
                onClick={nextPlayerOrder}
                className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-6 rounded-lg shadow-lg flex items-center gap-2"
              >
                Lock Orders & Finish
              </button>
            </div>
            
            {/* Context Help Bar */}
          <div className="h-8 flex justify-center">
            {pendingAction && (
              <div className="bg-stone-800 px-4 py-1 rounded-full border border-stone-600 text-sm font-bold animate-pulse text-yellow-400">
                Select an adjacent territory to {pendingAction}...
                <button onClick={() => setPendingAction(null)} className="ml-4 text-stone-400 hover:text-white underline">Cancel</button>
              </div>
            )}
          </div>

          <MapBoard 
            interactive={true} 
            currentPlayerId={playerOrder[currentPlayerIdx]} 
            showAllOrders={false} 
            territories={territories}
            orders={orders}
            setOrders={setOrders}
            selectedNode={selectedNode}
            setSelectedNode={setSelectedNode}
            pendingAction={pendingAction}
            setPendingAction={setPendingAction}
            mapData={mapConfig.nodes}
            currentEvent={currentEvent}
          />
          
          {/* Legend */}
            <div className="flex justify-center gap-6 text-sm text-stone-400 mt-2 bg-stone-900 p-3 rounded-lg border border-stone-800 max-w-2xl mx-auto flex-wrap">
              <span className="flex items-center gap-2"><Swords size={16} className="text-red-400"/> March / Attack</span>
              <span className="flex items-center gap-2"><Shield size={16} className="text-green-400"/> Defend (x2)</span>
              <span className={`flex items-center gap-2 ${currentEvent.id === 'FOG_OF_WAR' ? 'opacity-30 line-through' : ''}`}><Handshake size={16} className="text-blue-400"/> Support</span>
              <span className={`flex items-center gap-2 ${currentEvent.id === 'HARSH_WINTER' ? 'opacity-30 line-through' : ''}`}><Tent size={16} className="text-yellow-400"/> Muster</span>
              <span className="flex items-center gap-2"><Castle size={16} className="text-stone-300"/> Castle (+1 Def)</span>
            </div>
          </div>
        )}

        {/* --- REVEAL SCREEN --- */}
        {phase === 'REVEAL' && (
          <div className="flex flex-col gap-6 animate-fade-in">
             <div className="bg-red-900/30 p-4 rounded-xl border border-red-800 flex justify-between items-center shadow-lg text-center mx-auto w-full max-w-3xl">
                <div>
                  <h2 className="text-3xl font-black text-red-500 uppercase tracking-widest">Orders Revealed!</h2>
                  <p className="text-stone-300 text-sm mt-1">Behold the betrayals.</p>
                </div>
                <button 
                onClick={resolveTurn}
                className="bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-8 rounded-lg shadow-[0_0_15px_rgba(220,38,38,0.6)] flex items-center gap-2 text-xl transition-transform hover:scale-105"
              >
                Resolve Bloodshed
              </button>
            </div>
            <MapBoard 
              showAllOrders={true} 
              territories={territories}
              orders={orders}
              setOrders={setOrders}
              selectedNode={selectedNode}
              setSelectedNode={setSelectedNode}
              pendingAction={pendingAction}
              setPendingAction={setPendingAction}
              mapData={mapConfig.nodes}
              currentEvent={currentEvent}
            />
        </div>
      )}

      {/* --- GAME OVER SCREEN --- */}
      {phase === 'GAME_OVER' && winner && (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-fade-in">
          <Crown size={100} className="text-yellow-500 mb-6 drop-shadow-[0_0_20px_rgba(234,179,8,0.5)]" />
          <h2 className="text-6xl font-black mb-2 uppercase text-white">The War is Over</h2>
          <p className={`text-4xl font-bold mb-12 ${winner.text}`}>{winner.name} Claims the Throne!</p>
          
          <MapBoard 
            showAllOrders={false} 
            territories={territories}
            orders={orders}
            setOrders={setOrders}
            selectedNode={selectedNode}
            setSelectedNode={setSelectedNode}
            pendingAction={pendingAction}
            setPendingAction={setPendingAction}
            mapData={mapConfig.nodes}
            currentEvent={currentEvent}
          />

          <button 
            onClick={() => setPhase('TITLE')}
              className="mt-12 bg-stone-700 hover:bg-stone-600 text-white font-bold text-xl py-3 px-8 rounded-lg transition-transform hover:scale-105"
            >
              Play Again
            </button>
          </div>
        )}

      </main>

      {/* Basic global styles for animations embedded */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.4s ease-out forwards;
        }
        .hide-scroll::-webkit-scrollbar {
          display: none;
        }
      `}} />
    </div>
  );
}