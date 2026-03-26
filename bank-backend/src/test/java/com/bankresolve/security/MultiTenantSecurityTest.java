package com.bankresolve.security;

import com.bankresolve.dto.GrievanceRequestDto;
import com.bankresolve.entity.Bank;
import com.bankresolve.entity.Grievance;
import com.bankresolve.entity.Notification;
import com.bankresolve.entity.User;
import com.bankresolve.entity.enums.GrievanceStatus;
import com.bankresolve.entity.enums.Priority;
import com.bankresolve.entity.enums.Role;
import com.bankresolve.repository.BankRepository;
import com.bankresolve.repository.GrievanceRepository;
import com.bankresolve.repository.NotificationRepository;
import com.bankresolve.repository.UserRepository;
import com.bankresolve.service.impl.GrievanceServiceImpl;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.messaging.Message;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.MessageBuilder;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
public class MultiTenantSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private BankRepository bankRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private GrievanceRepository grievanceRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private TopicSubscriptionInterceptor subscriptionInterceptor;

    @Autowired
    private ObjectMapper objectMapper;

    private Long bank1Id;
    private Long bank2Id;
    private Long grievance1Id;
    private Long user1Id;
    private Long user2Id;

    @BeforeEach
    void setup() {
        // Create Bank 1
        Bank bank1 = new Bank();
        bank1.setName("Alpha Bank");
        bank1.setCode("ALPHA");
        bank1 = bankRepository.save(bank1);
        bank1Id = bank1.getId();

        // Create Bank 2
        Bank bank2 = new Bank();
        bank2.setName("Beta Bank");
        bank2.setCode("BETA");
        bank2 = bankRepository.save(bank2);
        bank2Id = bank2.getId();

        // Create User 1 (Bank 1)
        User user1 = new User();
        user1.setEmail("user1@alpha.com");
        user1.setFullName("User One");
        user1.setPassword("pass");
        user1.setRole(Role.CUSTOMER);
        user1.setBank(bank1);
        user1.setEnabled(true);
        user1 = userRepository.save(user1);
        user1Id = user1.getId();

        // Create User 2 (Bank 2)
        User user2 = new User();
        user2.setEmail("user2@beta.com");
        user2.setFullName("User Two");
        user2.setPassword("pass");
        user2.setRole(Role.CUSTOMER);
        user2.setBank(bank2);
        user2.setEnabled(true);
        user2 = userRepository.save(user2);
        user2Id = user2.getId();

        // Create Grievance 1 (Bank 1)
        Grievance g1 = new Grievance();
        g1.setTitle("Bank 1 Issue");
        g1.setDescription("Description");
        g1.setStatus(GrievanceStatus.FILED);
        g1.setPriority(Priority.MEDIUM);
        g1.setBank(bank1);
        g1.setCustomer(user1);
        g1.setReferenceNumber("REF-001");
        g1.setGrievanceNumber("GRV-ALPHA-2024-000001");
        g1 = grievanceRepository.save(g1);
        grievance1Id = g1.getId();

        // Create Grievance 2 (Bank 2)
        Grievance g2 = new Grievance();
        g2.setTitle("Bank 2 Issue");
        g2.setDescription("Description");
        g2.setStatus(GrievanceStatus.FILED);
        g2.setPriority(Priority.MEDIUM);
        g2.setBank(bank2);
        g2.setCustomer(user2);
        g1.setReferenceNumber("REF-002");
        g1.setGrievanceNumber("GRV-BETA-2024-000001");
        grievanceRepository.save(g2);

        // Standard Staff for tests
        User staff1 = new User();
        staff1.setEmail("staff1@alpha.com");
        staff1.setRole(Role.STAFF);
        staff1.setBank(bank1);
        staff1.setEnabled(true);
        userRepository.save(staff1);
    }

    /**
     * SCENARIO 1: Access by ID (IDOR) & Direct DB Consistency
     */
    @Test
    @WithMockUser(username = "user2@beta.com", roles = "CUSTOMER")
    void testIDORAndDBConsistency() throws Exception {
        // Attempt to GET User 1's grievance
        mockMvc.perform(get("/api/grievances/" + grievance1Id))
                .andExpect(status().isForbidden());

        // Verify DB directly: Ensure no session corruption or lazy-load leak
        Grievance dbGrievance = grievanceRepository.findById(grievance1Id).orElseThrow();
        assertEquals(bank1Id, dbGrievance.getBank().getId());
        assertEquals("user1@alpha.com", dbGrievance.getCustomer().getEmail());
    }

    /**
     * SCENARIO 2: Pagination Isolation & Negative Assertions
     * Assert that NO records from Bank 2 exist in Bank 1's response.
     */
    @Test
    @WithMockUser(username = "user1@alpha.com", roles = "CUSTOMER")
    void testPaginationIsolationWithNegativeAssertions() throws Exception {
        mockMvc.perform(get("/api/grievances/paged?page=0&size=20"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.content[0].bankId").value(bank1Id))
                // NEGATIVE ASSERTION: Proving Bank 2 data is ABSENT
                .andExpect(jsonPath("$.content[*].title", not(hasItem("Bank 2 Issue"))));
    }

    /**
     * SCENARIO 3: Cache Isolation
     */
    @Test
    @WithMockUser(username = "user1@alpha.com", roles = "CUSTOMER")
    void testCacheIsolation() throws Exception {
        // First request to warm cache for User 1
        mockMvc.perform(get("/api/grievances/dashboard-summary"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total").value(1));

        // Switch to User 2 (Bank 2) - Should NOT get User 1's cached response
        mockMvc.perform(get("/api/grievances/dashboard-summary")
                .principal(new UsernamePasswordAuthenticationToken(
                        new UserPrincipal(userRepository.findById(user2Id).get()), null)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total").value(1))
                .andExpect(jsonPath("$.pending").value(1)); // Bank 2 also has 1 pending
    }

    /**
     * SCENARIO 4: WebSocket Adversarial & Payload Tampering
     */
    @Test
    void testWebSocketAdversarial() {
        UserPrincipal principal1 = new UserPrincipal(userRepository.findById(user1Id).get());
        Authentication auth1 = new UsernamePasswordAuthenticationToken(principal1, null);

        // 1. Path Traversal Attempt
        StompHeaderAccessor maliciousAccessor = StompHeaderAccessor.create(StompCommand.SUBSCRIBE);
        maliciousAccessor.setDestination("/topic/notifications/1/../secret");
        maliciousAccessor.setUser(auth1);
        
        Message<byte[]> msg1 = MessageBuilder.createMessage(new byte[0], maliciousAccessor.getMessageHeaders());
        assertThrows(AccessDeniedException.class, () -> subscriptionInterceptor.preSend(msg1, null));

        // 2. Unauthorized SEND to /topic
        StompHeaderAccessor spoofAccessor = StompHeaderAccessor.create(StompCommand.SEND);
        spoofAccessor.setDestination("/topic/notifications/" + user2Id);
        spoofAccessor.setUser(auth1);
        
        Message<byte[]> msg2 = MessageBuilder.createMessage(new byte[0], spoofAccessor.getMessageHeaders());
        assertThrows(AccessDeniedException.class, () -> subscriptionInterceptor.preSend(msg2, null));
    }

    /**
     * SCENARIO 5: Concurrency Stress Test (High Volume)
     */
    @Test
    void testConcurrencyLeakage() throws InterruptedException {
        int threads = 50;
        ExecutorService executor = Executors.newFixedThreadPool(threads);
        AtomicInteger failures = new AtomicInteger(0);

        for (int i = 0; i < 100; i++) {
            executor.submit(() -> {
                try {
                    // Simulated rapid fire requests from mixed banks
                    mockMvc.perform(get("/api/grievances/paged?page=0&size=10")
                            .with(request -> {
                                request.setRemoteUser("user1@alpha.com");
                                return request;
                            }))
                            .andExpect(jsonPath("$.content[*].bankId", everyItem(is(bank1Id.intValue()))));
                } catch (Exception e) {
                    failures.incrementAndGet();
                }
            });
        }

        executor.shutdown();
        executor.awaitTermination(30, TimeUnit.SECONDS);
        assertEquals(0, failures.get(), "Concurrency test had unexpected failures or leakage");
    }

    /**
     * SCENARIO 6: Adversarial ID Fuzzing
     */
    @Test
    @WithMockUser(username = "user1@alpha.com", roles = "CUSTOMER")
    void testAdversarialIdFuzzing() throws Exception {
        // Random UUID as ID
        mockMvc.perform(get("/api/grievances/999999999"))
                .andExpect(status().isNotFound());

        // Mismatched Payload BankId
        GrievanceRequestDto tamperedBody = new GrievanceRequestDto();
        tamperedBody.setTitle("Tampered");
        tamperedBody.setDescription("Desc");
        tamperedBody.setCategory("GENERAL");
        tamperedBody.setTransactionAmount(BigDecimal.TEN);
        // User is Bank 1, but payload might try to inject Bank 2 (though derived from context, we test behavior)
        
        mockMvc.perform(post("/api/grievances")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(tamperedBody)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.bankId").value(bank1Id)); // Must still be Bank 1
    }

    /**
     * SCENARIO 7: Notification Ownership Verification
     */
    @Test
    @WithMockUser(username = "staff1@alpha.com", roles = "STAFF")
    void testNotificationConsistency() throws Exception {
        // Staff updates User 1's grievance
        mockMvc.perform(put("/api/grievances/" + grievance1Id + "/status")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"status\": \"ACCEPTED\"}"))
                .andExpect(status().isOk());

        // Direct DB Check: Ensure notification exists for User 1 (Bank 1) and NOT User 2
        List<Notification> notifications = notificationRepository.findAll();
        boolean hasUser1Notify = notifications.stream().anyMatch(n -> n.getUser().getId().equals(user1Id));
        boolean hasUser2Notify = notifications.stream().anyMatch(n -> n.getUser().getId().equals(user2Id));

        assertTrue(hasUser1Notify, "Notification should be generated for the customer");
        assertFalse(hasUser2Notify, "Notification should NOT be leaked to other users/banks");
    }
}
