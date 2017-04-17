let restify = require('restify');
let validation = require('./templates/validation.js');
let virtualNetwork = require('./templates/virtualNetworkSettings.js');
let routeTables = require('./templates/routeTableSettings.js');
let r = require('./templates/resources.js');

let virtualNetworkSettingsWithPeering = [
  {
    name: "my-virtual-network",
    addressPrefixes: [
      "10.0.0.0/16"
    ],
    subnets: [
      {
        name: "web",
        addressPrefix: "10.0.1.0/24"
      },
      {
        name: "biz",
        addressPrefix: "10.0.2.0/24"
      }
    ],
    dnsServers: [],
    virtualNetworkPeerings: [
      // {
      //   remoteVirtualNetwork: {
      //     //name: "my-other-virtual-network"
      //   },
      //   allowForwardedTraffic: true,
      //   allowGatewayTransit: true,
      //   useRemoteGateways: false
      // },
      {
        remoteVirtualNetwork: {
          name: "my-other-virtual-network"
        },
        allowForwardedTraffic: true,
        allowGatewayTransit: true,
        useRemoteGateways: false
      },
      {
        name: "provided-peering-name",
        remoteVirtualNetwork: {
          name: "my-third-virtual-network",
          resourceGroupName: "different-resource-group"
        },
        allowForwardedTraffic: false,
        allowGatewayTransit: false,
        useRemoteGateways: true
      }
    ]
  },
  {
    name: "my-other-virtual-network",
    addressPrefixes: [
      "10.1.0.0/16"
    ],
    subnets: [
      {
        name: "web",
        addressPrefix: "10.1.1.0/24"
      },
      {
        name: "biz",
        addressPrefix: "10.1.2.0/24"
      }
    ],
    dnsServers: [],
    virtualNetworkPeerings: [
      {
        name: "another-provided-peering-name",
        remoteVirtualNetwork: {
          name: "my-third-virtual-network",
          resourceGroupName: "different-resource-group"
        },
        allowForwardedTraffic: false,
        allowGatewayTransit: false,
        useRemoteGateways: true
      }
    ]
  },
  {
    name: "my-third-virtual-network",
    addressPrefixes: [
      "10.2.0.0/16"
    ],
    subnets: [
      {
        name: "web",
        addressPrefix: "10.2.1.0/24"
      },
      {
        name: "biz",
        addressPrefix: "10.2.2.0/24"
      }
    ],
    dnsServers: [],
    virtualNetworkPeerings: []
  }
];

let virtualNetworkSettings = [
  {
    name: "my-virtual-network",
    addressPrefixes: [
      "10.0.0.0/16"
    ],
    subnets: [
      {
        name: "web",
        addressPrefix: "10.0.1.0/24"
      },
      {
        name: "biz",
        addressPrefix: "10.0.2.0/24"
      }
    ],
    dnsServers: []
  },
  {
    name: "my-other-virtual-network",
    addressPrefixes: [
      "10.0.0.0/16"
    ],
    subnets: [
      {
        name: "web",
        addressPrefix: "10.0.1.0/24"
      },
      {
        name: "biz",
        addressPrefix: "10.0.2.0/24"
      }
    ],
    dnsServers: []
  }
];

function vnetTests(req, res, next) {
  let { settings, validationErrors } = virtualNetwork.transform({
    //settings: virtualNetworkSettings,
    settings: virtualNetworkSettingsWithPeering,
    buildingBlockSettings: {
      subscriptionId: "49741165-F4AF-456E-B47C-637AEAB82D50",
      resourceGroupName: "my-resource-group"
    }
  });

  if (validationErrors) {
    res.send(400, validationErrors);
  } else {
    res.send(settings);
  }
  next();
}

let routeTableSettings = [
  {
      name: "route-rt",
      virtualNetworks: [
        {
          name: "my-virtual-network",
          subnets: ["web", "biz"]
        },
        {
          name: "my-other-virtual-network",
          subnets: ["web"]
        }
      ],
      routes: [
        {
          name: "route1",
          addressPrefix: "10.0.1.0/24",
          nextHopType: "VnetLocal"
        },
        {
          name: "route2",
          addressPrefix: "10.0.2.0/24",
          nextHopType: "VirtualNetworkGateway"
        },
        {
          name: "route3",
          addressPrefix: "10.0.3.0/24",
          nextHopType: "VirtualAppliance",
          nextHopIpAddress: "192.168.1.1"
        }
      ]
    }
];

let routeTableSettings2 = {
  name: "route-rt",
  virtualNetworks: [
    {
      name: "my-virtual-network",
      subnets: ["web", "biz"]
    },
    {
      name: "my-other-virtual-network",
      subnets: ["web"]
    }
  ],
  routes: [
    {
      name: "route1",
      addressPrefix: "10.0.1.0/24",
      nextHopType: "VnetLocal"
    },
    {
      name: "route2",
      addressPrefix: "10.0.2.0/24",
      nextHopType: "VirtualNetworkGateway"
    },
    {
      name: "route3",
      addressPrefix: "10.0.3.0/24",
      nextHopType: "VirtualAppliance",
      nextHopIpAddress: "192.168.1.1"
    }
  ]
};

function routeTableTests(req, res, next) {
  routeTableSettings.push(routeTableSettings2);
  let { settings, validationErrors } = routeTables.transform({
    //settings: routeTableSettings2,
    settings: routeTableSettings,
    buildingBlockSettings: {
      subscriptionId: "3b518fac-e5c8-4f59-8ed5-d70b626f8e10",
      resourceGroupName: "template-v2-rg"
    }
  });

  if (validationErrors) {
    res.send(400, validationErrors);
  } else {
    res.send(settings);
  }

  next();
}

var server = restify.createServer();
server.get('/virtualNetwork', vnetTests);
server.get('/routeTable', routeTableTests);

server.listen(8080, function() {
  console.log('%s listening at %s', server.name, server.url);
});5

let vmSettings = require('./templates/virtualMachineSettings.js');

var virtualMachinesSettings = {
  "vmCount": 4,
  "namePrefix": "ra-single",
  "size": "Standard_DS10_v2",
  "imageReference": {
    "version": "NOT LATEST"
  },
  "adminUsername": "testuser",
  "adminPassword": "AweS0me@PW",
  "osAuthenticationType": "ssh",
  "nics": [

  ],
  "dataDisks": {
    "subscriptionId": "13321",
    "resourceGroup": "abc",
    "count": 3,
    "properties": {
      "diskSizeGB": 512,
      "caching": "None",
      "createOption": "Empty"
    }
  },
  "availabilitySet": {
    "subscriptionId": "13321",
    "resourceGroup": "abc",
    "useExistingAvailabilitySet": "No",
    "name": "test-as"
  }
}

let buildingBlockSettings = {
  "resourceGroup": "rg1",
  "subscription": "testsub"
}

//let vmParams = vmSettings.processVirtualMachineSettings(virtualMachinesSettings, buildingBlockSettings);
