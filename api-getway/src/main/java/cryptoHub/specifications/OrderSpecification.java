package cryptoHub.specifications;

import cryptoHub.entity.OrderEntity;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class OrderSpecification {
    public static Specification<OrderEntity> getOrderSpecification(String search) {
        Specification<OrderEntity> spec = new Specification<OrderEntity>() {
            @Override
            public Predicate toPredicate(Root<OrderEntity> root, CriteriaQuery<?> query, CriteriaBuilder criteriaBuilder) {
                if (search == null || search.isEmpty()) criteriaBuilder.conjunction();
                List<Predicate> predicates = new ArrayList<>();
                predicates.add(criteriaBuilder.like(root.get("asset"), "%" + search + "%"));
                predicates.add(criteriaBuilder.like(root.get("status"), "%" + search + "%"));
                return criteriaBuilder.or(predicates.toArray(new Predicate[0]));
            }
        };
        return spec;
    }
}
