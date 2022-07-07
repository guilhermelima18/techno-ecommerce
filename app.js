const vm = new Vue({
  el: "#app",
  data: {
    produtos: [],
    produto: {},
    carrinho: [],
    modalIsOpen: false,
    carrinhoTotal: 0,
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
        this.carrinho[indexProductExists].quantidade = this.carrinho[
          indexProductExists
        ].quantidade += 1;
        this.carrinho = [...this.carrinho];
      } else {
        const newObj = {
          ...produto,
          quantidade: 1,
        };
        this.carrinho = [...this.carrinho, newObj];
      }
    },
    removerItemCarrinho() {},
    getProductsStorage() {
      const storage = localStorage.getItem("@techno.produto");

      if (storage) {
        this.carrinho = JSON.parse(storage);
      }
    },
  },
  created() {
    this.getProdutos();
    this.getProductsStorage();
  },
  watch: {
    carrinho() {
      localStorage.setItem("@techno.produto", JSON.stringify(this.carrinho));
      this.valorTotalCarrinho();
    },
  },
});
