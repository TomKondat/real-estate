module.exports = class APImethods {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const filterQueryObj = { ...this.queryString };

    const forbiddenFields = ["sort", "fields", "page", "limit"];
    forbiddenFields.forEach((field) => delete filterQueryObj[field]);

    if (filterQueryObj.priceRange) {
      const [minPrice, maxPrice] = filterQueryObj.priceRange.split("-");
      delete filterQueryObj.priceRange
      filterQueryObj.price = { gte: minPrice, lte: maxPrice };
      console.log(filterQueryObj.price);

    }

    if (filterQueryObj.bedrooms) {
      const roomsValue = parseInt(filterQueryObj.bedrooms, 10);
      filterQueryObj.bedrooms = roomsValue === 3 ? { gte: 3 } : roomsValue;
    }
    let queryStr = JSON.stringify(filterQueryObj);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));

    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("price");
    }
    return this;
  }

  selectFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",").join(" ");
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select("-__v");
    }
    return this;
  }

  makePagination() {
    const page = parseInt(this.queryString.page, 10) || 1;
    const perPage = parseInt(this.queryString.limit, 10) || 8;
    const skipResults = (page - 1) * perPage;
    this.query = this.query.skip(skipResults).limit(perPage);
    return this;
  }
};
