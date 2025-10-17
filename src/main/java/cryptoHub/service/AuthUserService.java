package cryptoHub.service;

import cryptoHub.dto.LoginRequestDto;
import cryptoHub.entity.UserEntity;
import cryptoHub.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthUserService implements UserDetailsService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public UserEntity loadUserByUsername(String username) throws UsernameNotFoundException {
        return userRepository.findUserByUsernameOrEmail(username, username);
    }

    public boolean isCredentialsValid(LoginRequestDto loginRequestDto) throws Exception {
        UserEntity user = this.loadUserByUsername(loginRequestDto.getEmail());
        if (user == null) {
            throw new Exception("User not found");
        }
        if (!passwordEncoder.matches(loginRequestDto.getPassword(), user.getPassword())) {
            throw new Exception("Invalid Password....!");
        }
        return true;
    }
}
