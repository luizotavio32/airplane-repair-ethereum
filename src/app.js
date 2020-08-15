App = {
  loading: false,
  contracts: {},
  load: async () => {
    await App.loadWeb3()
    await App.loadAccount()
    await App.loadContract()
    await App.render()
  },
  loadWeb3: async () => {
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider
      web3 = new Web3(web3.currentProvider)
    } else {
      window.alert("Please connect to Metamask.")
    }
    if (window.ethereum) {
      window.web3 = new Web3(ethereum)
      try {
        await ethereum.enable()
        web3.eth.sendTransaction({})
      } catch (error) {
        alert('Acess denied');
      }
    }
    else if (window.web3) {
      App.web3Provider = web3.currentProvider
      window.web3 = new Web3(web3.currentProvider)
      web3.eth.sendTransaction({})
    }
    else {
      console.log('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  },

  loadAccount: async () => {
    App.account = web3.eth.accounts[0]
    console.log(account)
  },

  loadContract: async () => {
    const quotationContract = await $.getJSON('QuotationContract.json')
    App.contracts.QuotationContract = TruffleContract(quotationContract)
    App.contracts.QuotationContract.setProvider(App.web3Provider)
    App.quotationContract = await App.contracts.QuotationContract.deployed()
  },

  render: async () => {
    if (App.loading) {
      return
    }
    App.setLoading(true)
    $('#account').html(App.account)
    await App.renderQuotations()
    App.setLoading(false)
  },

  createQuotation: async () => {
    App.setLoading(true)
    const airplane = $('#airPlaneInput').val()
    const item = $('#repairInput').val()
    const obs = $('#obs').val()
    const tasks = []
    const completed = false
    const contentJSON = JSON.stringify({ airplane, item, obs, tasks, completed})
    await App.quotationContract.createQuotation(contentJSON)
    window.location.reload()
  },

  getTasksByQuotation: (QuotationId) => {
    const taskCount = await App.quotationContract.taskCount();
    const tasks = [];
    for(var i = 1; i <= taskCount; i++) {
      const task = await App.quotationContract.tasks(i);
      const taskId = task[0].toNumber();
      const content = JSON.parse(task[1]);
      if(content.QuotationId === QuotationId && content.Id === taskId) {
        tasks.push(content);
      }
    }
    return tasks;
  },

  renderQuotations: async () => {
     const quotationCount = await App.quotationContract.quotationCount()
     const $quotationTemplate = $('.quotationTemplate')
     for (var i = 1; i <= quotationCount; i++) {
      const quotation = await App.quotationContract.quotations(i)
      const quotationId = quotation[0].toNumber()
      const content = JSON.parse(quotation[1])
      const $newQuotationTemplate = $quotationTemplate.clone()
      $newQuotationTemplate.find('.content').html(content._airplane)
      $newQuotationTemplate.find('input')
      .prop('name', quotationId)
      .prop('checked', true)
      .on('click', App.toggleCompleted)

      if (false) {
        $('#completedTaskList').append($newTaskTemplate)
      } else {
        $('#taskList').append($newQuotationTemplate)
      }
    }
  },

  createTask: async (taskCount, QuotationId) => {
    App.setLoading(true)
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