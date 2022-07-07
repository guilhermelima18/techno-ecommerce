const vm = new Vue({
  el: "#app",
  data: {
    produtos: [],
    produto: {},
    carrinho: [],
    modalIsOpen: false,
    modalCarrinhoIsOpen: false,
    carrinhoTotal: 0,
    isDisabledButton: false,
    alertMessage: "",
    activeAlert: false,
  },
  filters: {
    formatPrice(value) {
      return value.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      });
    },
  },
  methods: {
    getProdutos() {
      fetch("./api/produtos.json")
        .then((response) => response.json())
        .then((data) => {
          const formattedProducts = data.map((produto) => ({
            ...produto,
            preco: produto.preco,
          }));
          this.produtos = formattedProducts;
        })
        .catch((err) => console.log(err));
    },
    getProduto(productId) {
      fetch(`./api/produtos/${productId}/dados.json`)
        .then((response) => response.json())
        .then((data) => {
          const formattedProduct = {
            ...data,
            preco: data.preco,
          };
          this.produto = formattedProduct;
        })
        .catch((err) => console.log(err));
    },
    openModal(productId) {
      this.getProduto(productId);
      this.modalIsOpen = true;
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    },
    closeModal(event) {
      if (event.target === event.currentTarget) {
        this.modalIsOpen = false;
      }
    },
    closeModalCarrinho(event) {
      if (event.target === event.currentTarget) {
        this.modalCarrinhoIsOpen = false;
      }
    },
    valorTotalCarrinho() {
      const total = this.carrinho.reduce((acc, item) => {
        return (acc += item.preco * item.quantidade);
      }, 0);

      this.carrinhoTotal = total;
    },
    adicionarItemCarrinho(produto) {
      const indexProductExists = this.carrinho.findIndex(
        (item) => item.id === produto.id
      );

      if (indexProductExists !== -1) {
        if (this.carrinho[indexProductExists].estoque === 0) {
          alert("Produto sem estoque");
          this.isDisabledButton = true;
          return;
        }

        this.carrinho[indexProductExists].quantidade += 1;
        this.carrinho[indexProductExists].estoque -= 1;
        this.carrinho = [...this.carrinho];
        this.alert(
          `${this.carrinho[indexProductExists].nome} adicionado ao carrinho`
        );
      } else {
        const newObj = {
          ...produto,
          quantidade: 1,
          estoque: (produto.estoque -= 1),
        };
        this.carrinho = [...this.carrinho, newObj];
        this.alert(`${newObj.nome} adicionado ao carrinho`);
      }
    },
    removerItemCarrinho(index) {
      this.carrinho.splice(index, 1);
    },
    getProductsStorage() {
      const storage = localStorage.getItem("@techno.produto");

      if (storage) {
        this.carrinho = JSON.parse(storage);
      }
    },
    alert(message) {
      this.alertMessage = message;
      this.activeAlert = true;

      setTimeout(() => {
        this.activeAlert = false;
      }, 2000);
    },
    router() {
      const hash = document.location.hash;

      if (hash) {
        const productId = hash.replace("#", "");
        this.openModal(productId);
      }
    },
  },
  created() {
    this.getProdutos();
    this.getProductsStorage();
    this.router();
  },
  watch: {
    carrinho() {
      localStorage.setItem("@techno.produto", JSON.stringify(this.carrinho));
      this.valorTotalCarrinho();
    },
    produto() {
      this.isDisabledButton = false;
      const title = `Techno | ${this.produto.nome}` || "Techno";
      const hashUrl = `#${this.produto.id}` || "";

      document.title = title;

      history.pushState(null, null, hashUrl);
    },
  },
});
