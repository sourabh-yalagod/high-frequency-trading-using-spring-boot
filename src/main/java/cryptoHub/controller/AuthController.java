package cryptoHub.controller;

import cryptoHub.dto.LoginRequestDto;
import cryptoHub.dto.LoginResponseDto;
import cryptoHub.entity.UserEntity;
import cryptoHub.repository.UserRepository;
import cryptoHub.service.AuthUserService;
import cryptoHub.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthUserService authUserService;
    private final JwtUtil jwtUtil;

    @PostMapping("/register")
    public ResponseEntity<UserEntity> registerUser(@RequestBody UserEntity userPayload) throws Exception {
        String identifier = userPayload.getEmail();
        if (identifier.isBlank()) identifier = userPayload.getUsername();
        UserEntity isUserExist = userRepository.findUserByUsernameOrEmail(userPayload.getUsername(), userPayload.getEmail());
        if (isUserExist != null) {
            throw new Exception(identifier + " Already used for Account Creation please try something different");
        }
        userPayload.setPassword(passwordEncoder.encode(userPayload.getPassword()));
        UserEntity user = userRepository.save(userPayload);
        return ResponseEntity.ok(user);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDto> loginUser(@RequestBody LoginRequestDto loginRequestDto) throws Exception {
        System.out.println("LoginRequestDto : " + loginRequestDto);
        UserEntity user = authUserService.loadUserByUsername(loginRequestDto.getEmail());
        if (user == null) {
            throw new Exception("User not found with " + loginRequestDto.getEmail());
        }
        boolean isCredentialsValid = authUserService.isCredentialsValid(loginRequestDto);
        System.out.println("isCredentialsValid : "+isCredentialsValid);
        if (!isCredentialsValid) {
            throw new Exception("Provided credentials are invalid...!");
        }
        Authentication authentication = new UsernamePasswordAuthenticationToken(
                loginRequestDto.getEmail(), loginRequestDto.getPassword()
        );
        System.out.println("authentication.getAuthorities()" + authentication.getAuthorities());
        System.out.println("authentication.getPrincipal()" + authentication.getPrincipal());
        System.out.println("authentication.getCredentials()" + authentication.getCredentials());
        String accessToken = jwtUtil.generateJwtToken(loginRequestDto.getEmail(), 10, authentication);
        String refreshToken = jwtUtil.generateJwtToken(loginRequestDto.getEmail(), 60 * 24 * 7, authentication);
        user.setRefreshToken(refreshToken);
        userRepository.save(user);
        LoginResponseDto loginResponse = LoginResponseDto.builder()
                .accessToken(accessToken)
                .refreshToken(user.getRefreshToken())
                .id(user.getId())
                .build();
        return ResponseEntity.ok(loginResponse);
    }
}
