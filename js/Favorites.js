import { GithubUser } from "./GithubUser.js";

export class Favorites {
  constructor(root) {
    this.root = document.querySelector(root);
    this.load();
  }

  load() {
    this.favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  }

  save() {
    localStorage.setItem("favorites", JSON.stringify(this.favorites));
  }

  async add(username) {
    try {
      const userAlreadyExists = this.favorites.find(
        (user) => user.login === username
      );
      if (userAlreadyExists) {
        throw new Error("User already exists");
      }

      const user = await new GithubUser(username);

      const userNotFoundGithub = user.login === undefined;
      if (userNotFoundGithub) {
        throw new Error("User not found");
      }

      this.favorites = [user, ...this.favorites];

      this.update();
      this.save();
      this.root.querySelector("#search").value = "";
    } catch (error) {
      alert(error.message);
    }
  }

  delete(user) {
    const filteredFavorites = this.favorites.filter(
      (favorite) => favorite.login !== user.login
    );

    this.favorites = filteredFavorites;

    this.update();
    this.save();
  }
}

export class FavoritesView extends Favorites {
  constructor(root) {
    super(root);
    this.tbody = this.root.querySelector("table tbody");

    this.handleAddClick();

    this.load();
    this.update();
  }

  update() {
    this.removeAllTr();

    if (this.favorites.length === 0) {
      const tr = document.createElement("tr");
      tr.innerHTML = `
              <td colspan="4">
                <div class="table__empty-data">
                  <h2>
                    <img
                      src="assets/Estrela.svg"
                      alt="Imagem de uma estrela com cara de impressionada."
                    />
                    Nenhum favorito ainda
                  </h2>
                </div>
              </td>
      `;
      this.tbody.append(tr);
      return;
    }

    this.favorites.forEach((user) => {
      const row = this.addRow();

      row.querySelector(".user-wrapper__username").textContent = user.login;
      row
        .querySelector("img")
        .setAttribute("src", `https://www.github.com/${user.login}.png`);
      row.querySelector("img").setAttribute("alt", user.name + " avatar");
      row.querySelector(".user-wrapper__at").textContent = user.name;
      row.querySelector(".table__repos").textContent = user.public_repos;
      row.querySelector(".table__followers").textContent = user.followers;

      row.querySelector(".table__btn-remove").onclick = () => {
        const isOk = confirm(
          "Tem certeza que deseja remover o usuário " + `${user.login}` + "?"
        );
        if (isOk) {
          this.delete(user);
        }
      };

      this.tbody.append(row);
    });
  }

  handleAddClick() {
    const btnFav = this.root.querySelector("#btn-fav");

    btnFav.onclick = () => {
      const { value } = this.root.querySelector("#search");

      this.add(value);
    };
  }

  addRow() {
    const tr = document.createElement("tr");

    tr.innerHTML = `
              <td class="table__user-wrapper">
                <div class="user-wrapper">
                  <img src="" alt="" />
                  <div>
                    <p class="user-wrapper__username"></p>
                    <span class="user-wrapper__at">/</span>
                  </div>
                </div>
              </td>
              <td class="table__repos"></td>
              <td class="table__followers"></td>
              <td class="table__actions">
                <button class="table__btn-remove">Remover</button>
              </td>
    `;

    return tr;
  }

  removeAllTr() {
    this.tbody.querySelectorAll("tr").forEach((tr) => {
      tr.remove();
    });
  }
}
