const fs = require("fs");

class Contenedor {
  constructor(fileName) {
    this._filename = fileName;
    this._readFileOrCreateNewOne();
  }

  async _readFileOrCreateNewOne() {
    try {
      await fs.promises.readFile(this._filename, "utf-8");
    } catch (error) {
      error.code === "ENOENT"
        ? this._createEmptyFile()
        : console.log(
            `Código de error: ${error.code} | Se produjo un error inesperado al intentar leer ${this._filename}`
          );
    }
  }

  async _createEmptyFile() {
    fs.writeFile(this._filename, "[]", (error) => {
      error
        ? console.log(error)
        : console.log(`El archivo ${this._filename} fue creado ya que no existia en el sistema`);
    });
  }

  async getById(id) {
    id = Number(id);
    try {
      const data = await this.getData();
      const parsedData = JSON.parse(data);

      return parsedData.find((producto) => producto.id === id);
    } catch (error) {
      console.log(
        `Error en el codigo: ${error.code} | Hubo un error al intentar obtener un elemento por su ID (${id})`
      );
    }
  }

  async deleteById(id) {
    try {
      id = Number(id);
      const data = await this.getData();
      const parsedData = JSON.parse(data);
      const objectIdToBeRemoved = parsedData.find(
        (producto) => producto.id === id
      );

      if (objectIdToBeRemoved) {
        const index = parsedData.indexOf(objectIdToBeRemoved);
        parsedData.splice(index, 1);
        await fs.promises.writeFile(this._filename, JSON.stringify(parsedData));
        return true;
      } else {
        console.log(`ID ${id} no existe este archivo`);
        return null;
      }
    } catch (error) {
      console.log(
        `Error en el codigo: ${error.code} | Hubo un error al intentar eliminar un elemento por su ID (${id})`
      );
    }
  }

  async updateById(id, newData) {
    try {
      id = Number(id);
      const data = await this.getData();
      const parsedData = JSON.parse(data);
      const objectIdToBeUpdated = parsedData.find(
        (producto) => producto.id === id
      );
      if (objectIdToBeUpdated) {
        const index = parsedData.indexOf(objectIdToBeUpdated);
        const {title, price, thumbnail} = newData;

        parsedData[index]['titulo'] = title;
        parsedData[index]['precio'] = price;
        parsedData[index]['imagen'] = thumbnail;
        await fs.promises.writeFile(this._filename, JSON.stringify(parsedData));
        return true;
      } else {
        console.log(`El id ${id} no existe en el archivo`);
        return null;
      }

    } catch (error) {
      `Error en el codigo: ${error.code} | Hubo un error al intentar actualizar un elemnto por su ID (${id})`
    }
  }

  async save(object) {
    try {
      const allData = await this.getData();
      const parsedData = JSON.parse(allData);

      object.id = parsedData.length + 1;
      parsedData.push(object);

      await fs.promises.writeFile(this._filename, JSON.stringify(parsedData));
      return object.id;
    } catch (error) {
      console.log(
        `Error en el codigo: ${error.code} | Hubo un error al intentar guardar un elemento`
      );
    }
  }

  async deleteAll() {
    try {
      await this._createEmptyFile();
    } catch (error) {
      console.log(
        `Hubo un error (${error.code}) al intentar eliminar todos los objetos`
      );
    }
  }

  async getData() {
    const data = await fs.promises.readFile(this._filename, "utf-8");
    return data;
  }

  async getAll() {
    const data = await this.getData();
    return JSON.parse(data);
  }
}

module.exports = Contenedor;
