import React from 'react';
import { Image } from 'react-bootstrap';
import PropTypes from 'prop-types';
import classNames from 'classnames';

const ProductImage = ({ libelle, id, image, layout, containerStyle }) => {
  // Fallback si pas d'image
  const finalImageSrc = image || '/assets/img/no-image.png';

  return (
    <div
      style={
        layout === 'grid'
          ? { height: '150px', width: '100%', ...containerStyle }
          : layout === 'list'
          ? {
              height: '100px',
              width: '100px',
              flexShrink: 0,
              ...containerStyle
            }
          : { ...containerStyle }
      }
      className={classNames('position-relative rounded overflow-hidden', {
        'h-sm-100': layout === 'list'
      })}
    >
      <Image
        rounded
        src={finalImageSrc}
        className="h-100 w-100"
        style={{ objectFit: 'cover', objectPosition: 'center' }}
        alt={libelle}
      />
    </div>
  );
};

ProductImage.propTypes = {
  libelle: PropTypes.string.isRequired,
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  image: PropTypes.string,
  layout: PropTypes.string.isRequired,
  containerStyle: PropTypes.object
};

export default ProductImage;
