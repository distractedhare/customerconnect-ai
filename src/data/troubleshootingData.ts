export interface TroubleshootingStep {
  id: string;
  label: string;
  action: string;
}

export interface SalesPivot {
  condition: string;
  pitch: string;
  benefit: string;
}

export interface TroubleshootingCategory {
  id: string;
  name: string;
  icon: string;
  commonIssues: string[];
  steps: TroubleshootingStep[];
  pivots: SalesPivot[];
  transferCriteria: string;
}

export const TROUBLESHOOTING_DATA: TroubleshootingCategory[] = [
  {
    id: 'phones',
    name: 'Phones',
    icon: 'Smartphone',
    commonIssues: ['Slow performance', 'Battery draining', 'Dropped calls', 'Screen damage'],
    steps: [
      { id: 'p1', label: 'Power Cycle', action: 'Have the customer restart the device. Fixes 50% of software glitches.' },
      { id: 'p2', label: 'Check Storage', action: 'Settings > General > Storage. If < 2GB free, performance will suffer.' },
      { id: 'p3', label: 'Update OS', action: 'Ensure they are on the latest iOS/Android version.' },
      { id: 'p4', label: 'Network Reset', action: 'Settings > General > Transfer or Reset > Reset Network Settings.' }
    ],
    pivots: [
      { 
        condition: 'Device is 2+ years old', 
        pitch: 'I see this model is a few generations back. Instead of spending time on tech support, we have a promotion where your trade-in value is actually higher than the cost of a repair.',
        benefit: 'New battery, better camera, and 5G speeds.'
      },
      {
        condition: 'Storage is full',
        pitch: 'You\'re hitting the limit on this device. We have a great deal on the 256GB model so you never have to delete a photo again.',
        benefit: 'Peace of mind and better performance.'
      }
    ],
    transferCriteria: 'Transfer to Tech Support ONLY if network reset fails and device is under warranty/P360.'
  },
  {
    id: 'bts',
    name: 'BTS (Watch/Tablet)',
    icon: 'Watch',
    commonIssues: ['Syncing issues', 'No cellular data', 'Battery life'],
    steps: [
      { id: 'b1', label: 'Toggle Bluetooth', action: 'Turn Bluetooth off and on for both phone and watch.' },
      { id: 'b2', label: 'Check Plan', action: 'Verify the DIGITS or Standalone plan is active in the system.' },
      { id: 'b3', label: 'Unpair/Repair', action: 'The "nuclear option" for watches. Fixes most sync issues.' }
    ],
    pivots: [
      {
        condition: 'Old tablet model',
        pitch: 'Since we\'re looking at your tablet, I noticed you qualify for a free upgrade to the latest 5G model when you add a line for a family member.',
        benefit: 'Faster streaming and better screen.'
      }
    ],
    transferCriteria: 'Transfer to Tech if unpairing/repairing doesn\'t resolve the DIGITS sync.'
  },
  {
    id: 'hint',
    name: 'Home Internet',
    icon: 'Wifi',
    commonIssues: ['Red light on gateway', 'Slow speeds', 'Connection dropping'],
    steps: [
      { id: 'h1', label: 'Placement Check', action: 'Is it near a window? High up? Away from microwaves?' },
      { id: 'h2', label: 'Factory Reset', action: 'Hold the reset button for 30 seconds.' },
      { id: 'h3', label: 'T-Life App', action: 'Check the signal strength (RSRP/RSRQ) in the T-Life app.' }
    ],
    pivots: [
      {
        condition: 'Weak signal in area',
        pitch: 'It looks like you\'re in a fringe area. Have you considered adding a mesh extender? It can boost your coverage throughout the house.',
        benefit: 'Consistent speeds in every room.'
      }
    ],
    transferCriteria: 'Transfer to HINT Support if factory reset doesn\'t clear the red light.'
  },
  {
    id: 'iot',
    name: 'IOT (SyncUP/Trackers)',
    icon: 'Zap',
    commonIssues: ['Not tracking', 'Offline in app', 'Battery issues'],
    steps: [
      { id: 'i1', label: 'OBD-II Check', action: 'Ensure SyncUP DRIVE is firmly plugged into the port.' },
      { id: 'i2', label: 'App Refresh', action: 'Log out and back into the SyncUP app.' },
      { id: 'i3', label: 'GPS Lock', action: 'Drive the vehicle for 10 minutes to re-establish GPS lock.' }
    ],
    pivots: [
      {
        condition: 'Old SyncUP model',
        pitch: 'You\'re using the older 4G tracker. The new 5G version includes roadside assistance and better vehicle diagnostics.',
        benefit: 'Enhanced safety and faster alerts.'
      }
    ],
    transferCriteria: 'Transfer to Tech if the device doesn\'t show "Online" after a 10-minute drive.'
  }
];
