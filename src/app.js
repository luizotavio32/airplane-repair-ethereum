App = {
  loading: false,
  contracts: {},

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
    await App.renderTasks()

    // Update loading state
    App.setLoading(false)
  },

  renderTasks: async () => {
    // Load the total task count from the blockchain
    const quotationCount = await App.quotationContract.taskCount()
    const $quotationTemplate = $('.quotationTemplate')

    // Render out each task with a new task template
    for (var i = 1; i <= quotationCount; i++) {
      // Fetch the task data from the blockchain
      const quotation = await App.quotationContract.quotations(i)
      console.log('quotation***', quotation)
      const quotationId = quotation[0].toNumber()
      const content = JSON.parse(quotation[2])
      content._airplane
      // Create the html for the task
      const $newQuotationTemplate = $quotationTemplate.clone()
      $newQuotationTemplate.find('.content').html(content._airplane)
      $newQuotationTemplate.find('input')
                      .prop('name', quotationId)
                      .prop('checked', true)
                      .on('click', App.toggleCompleted)

      // Put the task in the correct list
      if (false) {
        $('#completedTaskList').append($newTaskTemplate)
      } else {
        $('#taskList').append($newQuotationTemplate)
      }

      // Show the task
      $newQuotationTemplate.show()
      const $content = $('#content')
      $content.show();
    }
  },

  createQuotation: async () => {
    App.setLoading(true)
    const airplane = $('#airPlaneInput').val();
    const item = $('#repairInput').val();
    const obs = $('#obs').val();
    const content = JSON.stringify({ airplane, item, obs })
    await App.quotationContract.createQuotation(content)
    window.location.reload()
  },

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