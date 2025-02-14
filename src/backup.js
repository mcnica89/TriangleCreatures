return (
    <div className="flex flex-row justify-center items-center bg-gray-900 space-x-8">
      
      

      <Card className="max-w-2xl bg-gray-900 p-8 text-center flex gap-2">
        <CardHeader className="text-center">
          <CardTitle>Triangle Creature Simulator </CardTitle>
          <div className="space-y-1">
            <div style={{ fontSize: '2.25rem', color: '#d1d5db' }}>  
                Word #{getStateInfo().number}: {getStateInfo().word}
            </div>
            <div style={{ fontSize: '1.25rem', color: '#d1d5db' }}> 
              Binary: {getStateInfo().binaryState}
            </div>
          </div>
          <br></br>
          <div className="flex gap-2">
            <ButtonWhite 
              onClick={handleGo} 
              disabled={isSimulating}
              className="flex-1"
            >
              {isSimulating ? "Simulating..." : "Run Physics"}
            </ButtonWhite>
            <ButtonWhite
              onClick={toggleAutoRun}
              disabled={isSimulating}
              variant="secondary"
              className="flex-1"
            >
              {isAutoRun ? "AutoRun: ON" : "AutoRun: OFF"}
            </ButtonWhite>
            <br></br>
            <ButtonWhite
              onClick={setRandomWord}
              disabled={isSimulating}
              variant="secondary"
              className="flex-1"
            >
              {isSimulating ? "Simulating..." :"Random Word"}
            </ButtonWhite>
            <ButtonWhite
              onClick={setRandomOrientation}
              disabled={isSimulating}
              variant="secondary"
              className="flex-1"
            >
               {isSimulating ? "Simulating..." : "Random Rotation & Word"}
            </ButtonWhite>

            
        </div>
         
        </CardHeader>
        
        <CardContent>
          <div className="mb-4 flex flex-row items-center">
             <div className="grid grid-cols-2 gap-4 "> 
              {/* Pumps Section */}
              <div className="flex flex-col items-center"> 
                <h4 className="font-medium mb-2 text-center">  Pumps</h4>
                {pumps.map((pump, i) => (
                  <Button
                    key={`pump-${i}`}
                    onClick={() => togglePump(i)}
                    disabled={isSimulating}
                    color={pump ? 'border-[#ff1b6b]' : 'border-[#45caff]'}
                    className="mr-2 mb-2"
                  >
                    Pump {i + 1}: {pump ? "IN" : "OUT"}
                  </Button>
                ))}
              </div>
              <div>
                <h4 className="font-medium mb-2">Muscles</h4>
                {muscles.map((muscle, i) => (
                  <Button
                    key={`muscle-${i}`}
                    onClick={() => toggleMuscle(i)}
                    disabled={isSimulating}
                    color={muscle ? 'border-[#ff1b6b]' : 'border-[#45caff]'}
                    className="mr-2 mb-2"
                  >
                    Muscle {MLABEL[i]}: {muscle ? "EXPAND" : "CONTRACT"}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          
          {/* Triangle Creature Canvas */}
          <div className="border border-gray-700 rounded-lg p-4 mb-4 bg-gray-800">
            <svg viewBox="-2 -2 6 6" width="800" height="400">
              {/* Draw edges */}
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
              
              {/* Draw vertices with mass-based radius */}
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
                    fill="purple" //{LABEL_COLOR}
                    fontSize="0.25"
                  >
                    {i+1}
                  </text>
                </g>
              ))}
            </svg>
          </div>

          
        </CardContent>
      </Card>
    </div>
  );
};