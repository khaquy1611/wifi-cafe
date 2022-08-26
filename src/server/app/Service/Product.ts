import { ProductAttributeType } from '@stypes/index';
import ProductAttribute from '@smodel/Product/ProductAttribute';
// eslint-disable-next-line import/prefer-default-export
export const createProductAttribute = async (data: ProductAttributeType) => {
    const res = await new ProductAttribute(data).save();
    return res;
};
