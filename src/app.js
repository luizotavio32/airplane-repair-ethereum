App = {
  loading: false,
  contracts: {},
  ///////////////////////////////// METAMASK INTEGRATION /////////////////////////////////
  load: async () => {
    await App.loadWeb3()
    await App.loadAccount()
    await App.loadContract()
    await App.render()
  },
  // https://medium.com/metamask/https-medium-com-metamask-breaking-change-injecting-web3-7722797916a8
  loadWeb3: async () => {
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider
      web3 = new Web3(web3.currentProvider)
    } else {
      window.alert("Please connect to Metamask.")
    }
    // Modern dapp browsers...
    if (window.ethereum) {
      window.web3 = new Web3(ethereum)
      try {
        // Request account access if needed
        await ethereum.enable()
        // Acccounts now exposed
        web3.eth.sendTransaction({/* ... */})
      } catch (error) {
        // User denied account access...
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      App.web3Provider = web3.currentProvider
      window.web3 = new Web3(web3.currentProvider)
      // Acccounts always exposed
      web3.eth.sendTransaction({/* ... */})
    }
    // Non-dapp browsers...
    else {
      console.log('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  },

  loadAccount: async () => {
    // Set the current blockchain account
	App.account = web3.eth.accounts[0]
	console.log(account)
  },

  loadContract: async () => {
    // Create a JavaScript version of the smart contract
    const quotationContract = await $.getJSON('QuotationContract.json')
    App.contracts.QuotationContract = TruffleContract(quotationContract)
    App.contracts.QuotationContract.setProvider(App.web3Provider)
    // Hydrate the smart contract with values from the blockchain
    App.quotationContract = await App.contracts.QuotationContract.deployed()
  },

  render: async () => {
    // Prevent double render
    if (App.loading) {
      return
    }

    // Update app loading state
    App.setLoading(true)

    // Render Account
    $('#account').html(App.account)

    // Render Tasks
    await App.renderQuotations()

    // Update loading state
    App.setLoading(false)
  },

createQuotation: async () => {
	App.setLoading(true)
	const airplane = $('#airPlaneInput').val()
	const item = $('#repairInput').val()
	const obs = $('#obs').val()
	var id = await App.quotationContract.quotationCount()
	id = Number(id) + 1
	var tasks = []
  	const contentJSON = JSON.stringify({id, airplane, item, obs, tasks})
	await App.quotationContract.createQuotation(contentJSON)
	window.location.reload()
},

renderQuotations: async () => {
	// Load the total task count from the blockchain
	const quotationCount = await App.quotationContract.quotationCount()
	var table = document.getElementById("quotation-table")
     // Render out each task with a new task template
     for (var i = 1; i <= quotationCount; i++) {
		// Fetch the task data from the blockchain
		const quotation = await App.quotationContract.quotations(i)
		var row = table.insertRow(i)
		var id = row.insertCell(0);
		var airplane = row.insertCell(1);
		var item = row.insertCell(2);
		var obs = row.insertCell(3);
		var button = row.insertCell(4);
		const content = JSON.parse(quotation[1])

		id.innerHTML = `<a id="quoteID"> ${content.id}</a>`
		airplane.innerHTML = content.airplane
		item.innerHTML = content.item
		obs.innerHTML = content.obs
		button.innerHTML = '<button onclick=App.renderTasks() style="font-size: 10px;">Tasks</button>';
    }
  },

createTask: async (taskCount, QuotationId) => {
  App.setLoading(true)
  const taskCount = await App.quotationContract.taskCount() + 1;
  const QuotationId = $('#quoteID').val();
  const desc = $('#taskDescription').val();
  const its_priceable = $('#priceable').val();
  const price = 0;
  if(priceable) {
    price = $('#price').val();
  } else {
    price = -1;
  }

  var task = {
    id: taskCount, 
    description: desc,
    priceable: its_priceable,
    priceUSD: price,
    QuotationId,
  };

  const contentJSON = JSON.stringify(task);
  await App.quotationContract.createTask(contentJSON);
  window.location.reload();
},

///////////////////////////////////// END TASKS /////////////////////////////////////

  toggleCompleted: async (e) => {
    App.setLoading(true)
    const taskId = e.target.name
    await App.quotationContract.toggleCompleted(taskId)
    window.location.reload()
  },

  setLoading: (boolean) => {
    App.loading = boolean
    const loader = $('#loader')
    const content = $('#content')
    if (boolean) {
      loader.show()
      content.hide()
    } else {
      loader.hide()
      content.show()
    }
  }
}

$(() => {
  $(window).load(() => {
    App.load()
  })
})