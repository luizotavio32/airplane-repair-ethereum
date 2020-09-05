
App = {
  loading: false,
  contracts: {},

  ///////////////////////////////// METAMASK INTEGRATION //////////////////////////////////
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

    await App.renderQuotations()
    await App.renderTasks()
    
    
    const showTasks = await App.quotationContract.taskCount()

    const inputTask = $('#inputT')
    const showTask = $('#showT')
  
    const inputQuotation = $('#inputQ')
    const showQuoation = $('#showQ')
    
    if(showTasks == 0) {
      inputQuotation.show()
      showQuoation.show()
      inputTask.hide()
      showTask.hide()
      
    } else {
        inputQuotation.hide()
        showQuoation.hide()
        inputTask.show()
        showTask.show()
    }

    
    
  
    

    // Update loading state
    App.setLoading(false)

   

  },

///////////////////////////////// END METAMASK INTEGRATION /////////////////////////////////















///////////////////////////////////// QUOTATIONS /////////////////////////////////////


createQuotation: async () => {
	App.setLoading(true)
	const airplane = $('#airPlaneInput').val()
	const item = $('#repairInput').val()
  const obs = $('#obs').val()
  const userID = web3.eth.accounts[0];
  const date = new Date()
	var id = await App.quotationContract.quotationCount()
	id = Number(id) + 1
	var tasks = []
  const contentJSON = JSON.stringify({id, airplane, item, obs, userID, date, tasks})
	await App.quotationContract.createQuotation(contentJSON)
	window.location.reload()
},




renderQuotations: async () => {

	const quotationCount = await App.quotationContract.quotationCount()
	
	var table = document.getElementById("quotation-table")
 
     
    for (var i = 1; i <= quotationCount; i++) {
		
      const quotation = await App.quotationContract.quotations(i)
      var row = table.insertRow(i)
      var id = row.insertCell(0);
      var airplane = row.insertCell(1);
      var item = row.insertCell(2);
      var obs = row.insertCell(3);
      var user = row.insertCell(4);
      var data = row.insertCell(5);
      var button = row.insertCell(6);
      
      
      
      
      const content = JSON.parse(quotation[1])

      id.innerHTML = `<a id="quoteID${content.id}"> ${content.id}</a>`
      airplane.innerHTML = content.airplane
      item.innerHTML = content.item
      obs.innerHTML = content.obs
      user.innerHTML = content.userID
      data.innerHTML = content.date
      button.innerHTML = `<button onclick=App.showTasks(${content.id}) style="font-size: 10px;">Tasks</button>`;
      
        
       
       
    }
  },

  returnToQuotation: async () => {
    const inputTask = $('#inputT')
    const showTask = $('#showT')

    const inputQuotation = $('#inputQ')
    const showQuoation = $('#showQ')

    inputQuotation.show()
    showQuoation.show()
    inputTask.hide()
    showTask.hide()
  },

///////////////////////////////////// END QUOTATIONS /////////////////////////////////////

















///////////////////////////////////// TASKS /////////////////////////////////////


showTasks: async (id) => {

  App.renderTasks(id);
  console.log(id);
  const inputTask = $('#inputT')
  const showTask = $('#showT')
  inputTask.show()
  showTask.show()

  const inputQuotation = $('#inputQ')
  const showQuoation = $('#showQ')
  inputQuotation.hide()
  showQuoation.hide()
},

createTask: async (QuotationId) => {
  App.setLoading(true)
  var count = await App.quotationContract.taskCount();
  count = Number(count) + 1
  const QId = $('#quoteID').val();
  const desc = $('#taskDescription').val();
  const price = $('#price').val();;
  const date = new Date()

  var task = {
    id: count, 
    description: desc,
    priceUSD: price,
    userID: web3.eth.accounts[0],
    dateModified: date,
    QId,
    completed: 0
  };

  const contentJSON = JSON.stringify(task);
  await App.quotationContract.createTask(contentJSON);
  showtasks = 1
  window.location.reload()
  
  
},

renderTasks: async () => {
  const taskCount = await App.quotationContract.taskCount()
  const completedTaskCount = await App.quotationContract.completedTaskCount()
	
	var table = document.getElementById("task-table")
 
     // Render out each task with a new task template
    for (let i = 1; i <= taskCount; i++) {
			// Fetch the task data from the blockchain
		const task = await App.quotationContract.tasks(i)
		
		var row = table.insertRow(i)
		var id = row.insertCell(0);
		var desc = row.insertCell(1);
		var price = row.insertCell(2);
		var account = row.insertCell(3);
		var account2 = row.insertCell(4)
		var data = row.insertCell(5);
		var data2 = row.insertCell(6)
		var button = row.insertCell(7);
		
		
		
		
		
		const content = JSON.parse(task[1])
		
		row.id = `taskRow${content.id}`
		id.innerHTML = `<a id="taskID">${content.id}</a>`
		desc.innerHTML = content.description
		price.innerHTML = content.priceUSD
		account.innerHTML = content.userID
		data.innerHTML = content.dateModified
		button.innerHTML = `<button class = "task-button" onclick= "App.completeTasks('taskRow${content.id}', ${content.id})" style="font-size: 10px;"></button>`;
		document.getElementById(row.id).style.backgroundColor = '#e679';



		if(completedTaskCount > 0) {
			for (let j = 1; j <= completedTaskCount; j++) {
				const ctask = await App.quotationContract.completedTasks(j)
				console.log(ctask)
				const contentT = JSON.parse(ctask)
				if(content.id == contentT.id) {
					console.log(contentT)
					data2.innerHTML = contentT.date
					account2.innerHTML = contentT.userID
					document.getElementById(contentT.hid).style.backgroundColor = '#8ad897'
					break;
					
				}
			}
		}
      
    
  }

  



    

},

completeTasks: async(hid, taskID) => {

	const date = new Date()
	var completed = {
		id: taskID,
		hid: hid,
		userID: web3.eth.accounts[0],
		date: date,
	}

	console.log(completed)

	const contentJSON = JSON.stringify(completed);
	await App.quotationContract.createCompleteTask(contentJSON);
	showtasks = 1
	window.location.reload()

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
