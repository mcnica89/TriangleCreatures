import React, { useState, useEffect } from 'react';

const TriangleCreatureSimulator = () => { 
  const g = 10;
  const mu_kinetic = 0.15;
  const M_min = 1.0;
  const M_total = 15.0;
  const K_mass = 4.0;
  const L_min = 1.6;
  const L_max = 2.8;
  const K_spring = 9.0;
  const dt = 0.1;
  const TOTAL_FRAMES = 50;
  const FRAME_INTERVAL = 20;
  const BASE_RADIUS = 0.10; 

  const VERTEX_COLORS = ['#45caff', '#ff1b6b'];
  const EDGE_COLORS = ['#45caff', '#ff1b6b'];

  const MLABEL = ['AB', 'AC', 'BC']
  const VLABEL = ['A', 'B', 'C']
  

  const WORD_LIST = ['Ant', 'Bat', 'Bear', 'Bee', 'Beaver', 'Cat', 'Crab', 'Cow', 'Caribou', 'Dog', 'Duck', 'Deer', 'Elk', 'Fox', 'Frog', 'Goat', 'Goose', 'Hawk', 'Horse', 'Iguana', 'Jaguar', 'Jackal', 'Koala', 'Llama', 'Lynx', 'Loon', 'Mouse', 'Mole', 'Moose', 'Newt', 'Narwhale', 'Owl', 'Orca', 'Otter', 'Pig', 'Panda', 'Parrot', 'Quail', 'Rabbit', 'Rat', 'Seal', 'Shark', 'Swan', 'Skunk', 'Toad', 'Turtle', 'Tiger', 'Turkey', 'Urchin', 'Viper', 'Vulture', 'Whale', 'Wolf', 'Walrus', 'Yak', 'Zebra', 'Ant', 'Bat', 'Bear', 'Bee', 'Beaver', 'Cat', 'Crab', 'Cow'];

  const [positions, setPositions] = useState([
    [0, 0],   // vertex 0
    [2, 0],   // vertex 1
    [1, 1.7]  // vertex 2
  ]);
  const [velocities, setVelocities] = useState([
    [0, 0],
    [0, 0],
    [0, 0]
  ]);
  const [masses, setMasses] = useState([5, 5, 5]);
  const [pumps, setPumps] = useState([0, 0, 0]);
  const [muscles, setMuscles] = useState([0, 0, 0]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [showReward, setShowReward] = useState(false);
  const [rewardVal, setRewardVal] = useState(0);

  

  const [isAutoRun, setIsAutoRun] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [simulationFrames, setSimulationFrames] = useState([]);


  const calculateForces = (pos, vel, mass, pmp, msc) => {
    // Calculate edge vectors
    const edge01 = [pos[1][0] - pos[0][0], pos[1][1] - pos[0][1]];
    const edge02 = [pos[2][0] - pos[0][0], pos[2][1] - pos[0][1]];
    const edge12 = [pos[2][0] - pos[1][0], pos[2][1] - pos[1][1]];

    // Calculate lengths
    const length01 = Math.sqrt(edge01[0]**2 + edge01[1]**2);
    const length02 = Math.sqrt(edge02[0]**2 + edge02[1]**2);
    const length12 = Math.sqrt(edge12[0]**2 + edge12[1]**2);

    // Normalize directions
    const epsilon = 1e-8;
    const dir01 = [edge01[0]/Math.max(length01, epsilon), edge01[1]/Math.max(length01, epsilon)];
    const dir02 = [edge02[0]/Math.max(length02, epsilon), edge02[1]/Math.max(length02, epsilon)];
    const dir12 = [edge12[0]/Math.max(length12, epsilon), edge12[1]/Math.max(length12, epsilon)];

    // Calculate equilibrium lengths
    const eqLengths = msc.map(m => L_min + m * (L_max - L_min));

    // Calculate spring forces
    const sForce01 = [-K_spring * (length01 - eqLengths[0]) * dir01[0],
                      -K_spring * (length01 - eqLengths[0]) * dir01[1]];
    const sForce02 = [-K_spring * (length02 - eqLengths[1]) * dir02[0],
                      -K_spring * (length02 - eqLengths[1]) * dir02[1]];
    const sForce12 = [-K_spring * (length12 - eqLengths[2]) * dir12[0],
                      -K_spring * (length12 - eqLengths[2]) * dir12[1]];

    // Initialize forces array
    const forces = Array(3).fill().map(() => [0, 0]);

    // Accumulate spring forces
    forces[0] = [-sForce01[0] - sForce02[0], -sForce01[1] - sForce02[1]];
    forces[1] = [sForce01[0] - sForce12[0], sForce01[1] - sForce12[1]];
    forces[2] = [sForce02[0] + sForce12[0], sForce02[1] + sForce12[1]];

    // Calculate friction forces
    for (let i = 0; i < 3; i++) {
      const speed = Math.sqrt(vel[i][0]**2 + vel[i][1]**2);
      const kineticFriction = mu_kinetic * mass[i] * g;
      forces[i][0] -= kineticFriction * vel[i][0] / Math.max(speed,epsilon);
      forces[i][1] -= kineticFriction * vel[i][1] / Math.max(speed,epsilon);
    }

    return forces;
  };

  const updateTriangle = (currentPos, currentVel, currentMass) => {
    // Convert pumps to fractions
    const epsilon = 1e-6;
    const pumpSum = pumps.reduce((a, b) => a + b, 0) + 3 * epsilon;
    const pumpsFraction = pumps.map(p => (p + epsilon) / pumpSum);
    
    // Calculate equilibrium masses
    const massesEq = pumpsFraction.map(p => M_min + p * (M_total - 3 * M_min));

    // RK2 Method Implementation
    const forces = calculateForces(currentPos, currentVel, currentMass, pumps, muscles);
    const accelerations = forces.map((f, i) => [f[0]/currentMass[i], f[1]/currentMass[i]]);

    // Halfway calculations
    const massesHalf = currentMass.map((m, i) => 
      m + (m - massesEq[i]) * (Math.exp(-K_mass * 0.5 * dt) - 1));
    
    const positionsHalf = currentPos.map((p, i) => [
      p[0] + 0.5 * dt * currentVel[i][0],
      p[1] + 0.5 * dt * currentVel[i][1]
    ]);
    
    const velocitiesHalf = currentVel.map((v, i) => [
      v[0] + 0.5 * dt * accelerations[i][0],
      v[1] + 0.5 * dt * accelerations[i][1]
    ]);

    const forcesHalf = calculateForces(positionsHalf, velocitiesHalf, massesHalf, pumps, muscles);
    const accelerationsHalf = forcesHalf.map((f, i) => [f[0]/massesHalf[i], f[1]/massesHalf[i]]);

    // Final calculations
    const massesFinal = currentMass.map((m, i) => 
      m + (m - massesEq[i]) * (Math.exp(-K_mass * dt) - 1));
    
    const positionsFinal = currentPos.map((p, i) => [
      p[0] + dt * velocitiesHalf[i][0],
      p[1] + dt * velocitiesHalf[i][1]
    ]);
    
    const velocitiesFinal = currentVel.map((v, i) => [
      v[0] + dt * accelerationsHalf[i][0],
      v[1] + dt * accelerationsHalf[i][1]
    ]);

    return {
      positions: positionsFinal,
      velocities: velocitiesFinal,
      masses: massesFinal
    };
  };

  const getStateInfo = () => {
    const pumpsFlat = (pumps[0] << 2) + (pumps[1] << 1) + pumps[2];
    const musclesFlat = (muscles[0] << 2) + (muscles[1] << 1) + muscles[2];
    const stateNumber = pumpsFlat * 8 + musclesFlat;
    return {
      number: stateNumber,
      word: WORD_LIST[stateNumber],
      binaryState: `${pumps.join(' ')} ${muscles.join(' ')}`
    };
  };

  const calculateAllFrames = () => {
    let frames = [];
    let currentState = {
      positions: [...positions],
      velocities: [...velocities],
      masses: [...masses]
    };

    frames.push({ ...currentState });

    for (let i = 0; i < TOTAL_FRAMES; i++) {
      currentState = updateTriangle(
        currentState.positions,
        currentState.velocities,
        currentState.masses
      );
      frames.push({ ...currentState });
    }

    return frames;
  };

  const setRandomOrientation = () => {
    const angle = Math.random() * 2 * Math.PI;
    const radius = 1;
    
    const newPositions = [
      [radius * Math.cos(angle), radius * Math.sin(angle)],
      [radius * Math.cos(angle + (2*Math.PI/3)), radius * Math.sin(angle + (2*Math.PI/3))],
      [radius * Math.cos(angle + (4*Math.PI/3)), radius * Math.sin(angle + (4*Math.PI/3))]
    ];
    
    const newVelocities = [[0,0], [0,0], [0,0]];
    const newPumps = Array(3).fill(0).map(() => Math.random() < 0.5 ? 1 : 0);
    const newMuscles = Array(3).fill(0).map(() => Math.random() < 0.5 ? 1 : 0);
    setShowReward(false);
    setPositions(newPositions);
    setVelocities(newVelocities);
    setPumps(newPumps);
    setMuscles(newMuscles);
    setIsSimulating(false);
    setCurrentFrame(0);
  };

  const calculateReward = () => {
    setRewardVal( 0.33*(positions[0][0] + positions[1][0] + positions[2][0]) - Math.abs(0.33*(positions[0][1] + positions[1][1] + positions[2][1])) );
    setShowReward(true);
  };

  // `useEffect` to run `handleGo` when positions or velocities change
  useEffect(() => {
    if (isAutoRun){
    if (muscles && pumps && positions && velocities && !isSimulating) {
      handleGo();  // Automatically start simulation after positions/velocities change
    }
    }
  }, [isAutoRun, muscles, positions, velocities, pumps]); // Depend on positions and velocities


  useEffect(() => {
    if (isSimulating && currentFrame < TOTAL_FRAMES) {
      const timer = setTimeout(() => {
        const frame = simulationFrames[currentFrame];
        setPositions(frame.positions);
        setVelocities(frame.velocities);
        setMasses(frame.masses);
        setCurrentFrame(prev => prev + 1);
      }, FRAME_INTERVAL);

      return () => clearTimeout(timer);
    } else if (currentFrame >= TOTAL_FRAMES) {
      setIsSimulating(false);
    }
  }, [isSimulating, currentFrame, simulationFrames]);

  const handleGo = () => {
    if (!isSimulating) {
      const frames = calculateAllFrames();
      setShowReward(false);
      setSimulationFrames(frames);
      setCurrentFrame(0);
      setIsSimulating(true);
    }
  };

  const toggleAutoRun = () => {
    setIsAutoRun(prev => !prev);
  }

  const togglePump = (index) => {
    if (!isSimulating) {
      const newPumps = [...pumps];
      newPumps[index] = 1 - newPumps[index];
      setPumps(newPumps);
    }
  };

  const toggleMuscle = (index) => {
    if (!isSimulating) {
      const newMuscles = [...muscles];
      newMuscles[index] = 1 - newMuscles[index];
      setMuscles(newMuscles);
    }
  };

  const getEdges = () => [
    [0, 1],
    [0, 2],
    [1, 2]
  ];

  const getRadius = (mass) => BASE_RADIUS * Math.sqrt(mass);

  const ButtonWhite = ({ onClick, disabled, children }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-4 bg-gray-100 py-2 rounded-lg border-2 text-white ${
        disabled
          ? "bg-gray-500 cursor-not-allowed"
          : "bg-white border-[#45caff] hover:bg-[#45caff] hover:text-gray-900"
      }`}
    >
      {children}
    </button>
  );

  const Button = ({ onClick, disabled, children, color }) => (
    <button
      style={{ marginRight: '16px' }}
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 rounded-lg transition-all ${
        disabled
          ? "bg-gray-500 cursor-not-allowed text-gray-300"
          : `border-2 ${color} hover:${color === 'border-[#ff1b6b]' ? 'border-[#ff1b6b]' : 'border-[#45caff]'} 
            ${color === 'border-[#ff1b6b]' ? 'bg-[#ff1b6b33]' : 'bg-[#45caff33]'} 
            hover:${color === 'border-[#ff1b6b]' ? 'bg-[#ff1b6b55]' : 'bg-[#45caff55]'}`
      }`}
      style={{ color: color === 'border-[#ff1b6b]' ? '#ff1b6b' : '#45caff' }}
    >
      {children}
    </button>
  );


  return (
    <div className="flex flex-row justify-center items-start bg-gray-900 space-x-8 p-8">
        <br />


      Physics Simulation:
            <ButtonWhite onClick={handleGo} disabled={isSimulating} className="flex-1">
              {isSimulating ? "RUNNING" : "PAUSED"}
            </ButtonWhite> 
             &nbsp; AutoPlay: 
             <ButtonWhite onClick={toggleAutoRun} variant="secondary" className="flex-1">
              {isAutoRun ? "ON" : "OFF"}
            </ButtonWhite>
            &nbsp;  
            <ButtonWhite onClick={setRandomOrientation} variant="secondary" className="flex-1">
               Reset to Random State {/* {isSimulating ? "RESET" : "RESET"} */}
            </ButtonWhite>

            &nbsp;

            <ButtonWhite onClick={calculateReward} variant="secondary" className="flex-1">
               {showReward ? `REWARD = ${rewardVal.toFixed(2)}` : "Calculate Reward" }
            </ButtonWhite>

            <br/>
            <br/>

      
          <div className="center">
            <div style={{ fontSize: '2.25rem'}}>  
                Action Word #{getStateInfo().number}: {getStateInfo().word}
            </div>
            <div style={{ fontSize: '1.15rem', color: '#d1d5db' }}> 
              {getStateInfo().binaryState}
            </div>
          </div>
          
                &nbsp; Vertex Pumps:
                {pumps.map((pump, i) => (
                  <Button
                    style={{ marginRight: '8px' }}
                    key={`pump-${i}`}
                    onClick={() => togglePump(i)}
                    disabled={isSimulating}
                    color={pump ? 'border-[#ff1b6b]' : 'border-[#45caff]'}
                    className="mr-2 mb-2"
                  >
                    Pump {VLABEL[i]}: <br/> {pump ? "IN" : "OUT"}
                  </Button>
                ))}
                &nbsp; Edge Muscles: 
    
                {muscles.map((muscle, i) => (
                  <Button
                    key={`muscle-${i}`}
                    onClick={() => toggleMuscle(i)}
                    disabled={isSimulating}
                    color={muscle ? 'border-[#ff1b6b]' : 'border-[#45caff]'}
                    className="mr-2 mb-2"
                  >
                    Muscle {MLABEL[i]}: <br/> {muscle ? "EXPAND" : "CONTRACT"}
                  </Button> 
                ))} 
         


      <div className="flex-1 flex items-center justify-center border border-gray-700 rounded-lg p-4 bg-gray-800">
      <div className="aspect-square w-full max-w-lg bg-gray-800">
        <svg viewBox="-6.25 -2.5 12.5 5" width="1000" height="400">
          <line
            x1="6.15" 
            y1="0" 
            x2="6.25" 
            y2="0" 
            stroke="gray" 
            strokeWidth="0.01"
          />
          <line
            x1="0" 
            y1="2.4" 
            x2="0" 
            y2="2.5" 
            stroke="gray" 
            strokeWidth="0.01"
          />
          {getEdges().map((edge, i) => (
            <line
              key={`edge-${i}`}
              x1={positions[edge[0]][0]}
              y1={positions[edge[0]][1]}
              x2={positions[edge[1]][0]}
              y2={positions[edge[1]][1]}
              stroke={muscles[i] ? EDGE_COLORS[1] : EDGE_COLORS[0]}
              strokeWidth="0.05"
            />
          ))}
          {positions.map((pos, i) => (
            <g key={i}>
              <circle
                cx={pos[0]}
                cy={pos[1]}
                r={getRadius(masses[i])}
                fill={pumps[i] ? VERTEX_COLORS[1] : VERTEX_COLORS[0]}
              />
              <text
                x={pos[0]}
                y={pos[1]}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="purple"
                fontSize="0.25"
              >
                {VLABEL[i]}
              </text>
            </g>
          ))}
        </svg>
      </div>
      </div>
  
    </div>
  );
};
export default TriangleCreatureSimulator;
