import Vue from "vue";
import AV from "leancloud-storage"

AV.init({
  appId: "1Xc77oO2QeqkR673C4pGnJhJ-gzGzoHsz",
  appKey: "CmzLtIVXSPC3lefBIMlqqIaU"
});


var app = new Vue({
  el: '#app',
  data: {
    newTodo: "",
    todoList: [],
    actionType: "signUp",
    formData: {
      user: "",
      password: ""
    },
    currentUser: null
  },
  created: function(){
    this.currentUser = this.getCurrentUser();
    this.fetchTodos();
  },
  methods: {
  	fetchTodos: function(){
	    if(this.currentUser) {
	    	var query = new AV.Query("TodoFolder");
	    	query.find().then((todos) => {
	    		let avAllTodos = todos[0]
	    		let id = avAllTodos.id
	    		this.todoList = JSON.parse(avAllTodos.attributes.content)
	    		this.todoList.id = id
	    	}, function(error){
	    		console.log(error)
	    	})
	    }
  	},
  	updateTodos: function(){
  		let dataString = JSON.stringify(this.todoList)
  		let todoFolder = AV.Object.createWithoutData("TodoFolder", this.todoList.id);
  		todoFolder.set("content", dataString);
  		todoFolder.save().then(function(todo){
  			console.log("更新成功");
  		}, function(error){
  			console.log("更新失败");
  		});
  	},
  	saveTodos: function(){
  		var dataString = JSON.stringify(this.todoList);
   		var TodoFolder = AV.Object.extend("TodoFolder");
  		var todoFolder = new TodoFolder();
  		var acl = new AV.ACL();
  		acl.setReadAccess(AV.User.current(), true);
  		acl.setWriteAccess(AV.User.current(), true);
  		todoFolder.set("content", dataString);
  		todoFolder.setACL(acl);
  		todoFolder.save().then((todo) => {
  			this.todoList.id = todo.id
  			console.log("保存成功");
  		}, function(error){
  			console.log("保存失败");
  		});
  	},
  	saveOrUpdateTodos: function(){
  		if(this.todoList.id){
  			this.updateTodos()
  		} else {
  			this.saveTodos()
  		}
  	},
  	submit: function(event) {
  		console.log(this.todoList)
  		this.todoList.push({
  			title: this.newTodo,
  			createAt: (new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString()),
  			done: false
  		})
  		this.saveOrUpdateTodos();
  		this.newTodo =""
  	},
  	deleteTodo: function(event) {
  		let index = this.todoList.indexOf(event)
  		this.todoList.splice(index,1)
  		this.saveOrUpdateTodos();
  	},
    changeToSignUp: function(event){
      this.actionType = "signUp";
      var btn = document.getElementsByClassName("btn")
      for (var i=0;i<btn.length;i++) {
        btn[i].setAttribute("class", "btn");
      }     
      event.target.setAttribute("class", "btn active")
    },
    changeToSignIn: function(){
      this.actionType = "signIn";
      var btn = document.getElementsByClassName("btn")
      for (var i=0;i<btn.length;i++) {
        btn[i].setAttribute("class", "btn");
      }     
      event.target.setAttribute("class", "btn active")    
    },
    signUp: function(){
      var user = new AV.User();
      user.setUsername(this.formData.user);
      user.setPassword(this.formData.password);
      user.signUp().then((loginedUser) => {
        this.currentUser = this.getCurrentUser()
      }, function(error){
        alert("注册失败")
      });
    },
    login: function(){
      AV.User.logIn(this.formData.user, this.formData.password).then((loginedUser) => {
        this.currentUser = this.getCurrentUser();
        this.fetchTodos();
      }, function(error){
        alert("登陆失败")
      })
    },
    logout: function(){
      AV.User.logOut();
      this.currentUser = null;
      window.location.reload();
    },
    getCurrentUser: function(){
      let current = AV.User.current();
      if (current) {
        let {id, createdAt, attributes:{username}} = AV.User.current();
        return {id, username, createdAt}
      } else {
        return null
      }
    }
  }
})   